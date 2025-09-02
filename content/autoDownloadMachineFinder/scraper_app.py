import tkinter as tk
from tkinter import scrolledtext, filedialog, messagebox
from tkinter import ttk
import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO
import os
import threading
import re
import time
import traceback
import json
from datetime import datetime
from urllib.parse import urlparse
from urllib3.util.retry import Retry
from requests.adapters import HTTPAdapter


class ScraperApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Machinery Trader Scraper v7.0 (with Debug)")
        self.root.geometry("980x820")
        self.session = None

        # ランタイム保持: 直近HTML・レスポンス情報・フォトURL等
        self.last_html = None
        self.last_response_info = {}
        self.last_photo_urls = []
        self.last_details = {}
        self.debug_enabled = tk.BooleanVar(value=True)  # 既定: 詳細ON

        self.setup_ui()

    # ==============================
    # UI
    # ==============================
    def setup_ui(self):
        # URL行
        url_frame = ttk.Frame(self.root, padding="10 10 10 0")
        url_frame.pack(fill=tk.X)
        ttk.Label(url_frame, text="URL:", width=6).pack(side=tk.LEFT)
        self.url_entry = ttk.Entry(url_frame)
        self.url_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=6)
        self.scrape_button = ttk.Button(url_frame, text="データを取得", command=self.start_scraping_thread)
        self.scrape_button.pack(side=tk.LEFT, padx=4)

        # オプション行
        opt_frame = ttk.Frame(self.root, padding="10 4 10 0")
        opt_frame.pack(fill=tk.X)
        self.chk_detail = ttk.Checkbutton(opt_frame, text="詳細デバッグ", variable=self.debug_enabled)
        self.chk_detail.pack(side=tk.LEFT)

        self.save_log_btn = ttk.Button(opt_frame, text="デバッグログを保存", command=self.save_debug_log)
        self.save_log_btn.pack(side=tk.LEFT, padx=6)

        self.save_html_btn = ttk.Button(opt_frame, text="HTMLを保存", command=self.save_last_html)
        self.save_html_btn.pack(side=tk.LEFT, padx=6)

        # ノートブック（結果／デバッグ）
        nb = ttk.Notebook(self.root)
        nb.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # 結果タブ
        result_tab = ttk.Frame(nb)
        nb.add(result_tab, text="結果")
        self.result_text = scrolledtext.ScrolledText(result_tab, wrap=tk.WORD, state='disabled', height=18)
        self.result_text.pack(fill=tk.BOTH, expand=True)

        # デバッグタブ
        debug_tab = ttk.Frame(nb)
        nb.add(debug_tab, text="デバッグ")
        self.debug_text = scrolledtext.ScrolledText(debug_tab, wrap=tk.WORD, state='disabled', height=18)
        self.debug_text.pack(fill=tk.BOTH, expand=True)

        # ステータス／プログレス
        status_frame = ttk.Frame(self.root, padding="10 6 10 10")
        status_frame.pack(fill=tk.X)
        self.status_label = ttk.Label(status_frame, text="待機中...")
        self.status_label.pack(fill=tk.X)
        self.progress_bar = ttk.Progressbar(status_frame, orient='horizontal', mode='determinate')
        self.progress_bar.pack(fill=tk.X, pady=(6, 0))

    # ==============================
    # スレッド起動
    # ==============================
    def start_scraping_thread(self):
        url = self.url_entry.get().strip()
        if not url.startswith("https://www.machinerytrader.com"):
            messagebox.showwarning("警告", "有効な Machinery Trader のURLを入力してください。")
            return

        self.scrape_button.config(state='disabled')
        self.progress_bar['value'] = 0
        self.update_status("処理を開始します...")

        # 出力初期化
        self.set_text(self.result_text, f"処理中のURL: {url}\n\n", replace=True)
        self.set_text(self.debug_text, "", replace=True)

        # バックグラウンド実行
        thread = threading.Thread(target=self.run_scraping_task, args=(url,), daemon=True)
        thread.start()

    # ==============================
    # メイン処理
    # ==============================
    def run_scraping_task(self, url):
        start_all = time.perf_counter()
        try:
            self.update_status("セッション初期化中...")
            self.init_session()

            # --------------------
            # ネットワーク: HEADで疎通＆メタ確認
            # --------------------
            self.debug(f"[HEAD] {url}")
            t0 = time.perf_counter()
            head_resp = self.session.head(url, timeout=15, allow_redirects=True)
            t1 = time.perf_counter()
            self.debug_http_response("HEAD", head_resp, t1 - t0)

            # --------------------
            # ネットワーク: GET本体
            # --------------------
            self.update_status("Webページから情報を取得中...")
            self.debug(f"[GET] {url}")
            t0 = time.perf_counter()
            resp = self.session.get(url, timeout=20, allow_redirects=True)
            t1 = time.perf_counter()
            self.debug_http_response("GET", resp, t1 - t0)

            resp.raise_for_status()
            self.last_html = resp.text
            soup = BeautifulSoup(resp.text, 'html.parser')

            # --------------------
            # 詳細情報
            # --------------------
            self.update_status("詳細情報を解析中...")
            details, extract_report = self.extract_details(soup)
            self.last_details = details
            self.debug("抽出レポート: " + json.dumps(extract_report, ensure_ascii=False, indent=2))
            self.debug("抽出詳細（概要）: " + json.dumps({k: details.get(k) for k in ["Year","Manufacturer","Model","Serial Number","Hours","Price"]}, ensure_ascii=False))

            # 必須キー確認
            required_keys = ["Year", "Manufacturer", "Model"]
            missing_keys = [key for key in required_keys if not details.get(key) or details[key] == "N/A"]
            if missing_keys:
                raise ValueError(f"ページの基本情報(年/メーカー/モデル)が取得できませんでした: {', '.join(missing_keys)}")

            # --------------------
            # 写真URL抽出
            # --------------------
            self.update_status("写真のURLを解析中...")
            photo_urls, photo_report = self.extract_photo_urls(soup)
            self.last_photo_urls = photo_urls
            self.debug("写真抽出レポート: " + json.dumps(photo_report, ensure_ascii=False, indent=2))
            self.debug(f"写真URL件数: {len(photo_urls)}")
            if not photo_urls:
                self.append_text(self.result_text, "警告: 写真が見つかりませんでした。\n")

            # --------------------
            # 保存先選択へ
            # --------------------
            self.root.after(0, self.ask_save_location_and_proceed, details, photo_urls, resp.url)

        except requests.exceptions.RequestException as e:
            self.debug_exception("ネットワークエラー", e)
            self.handle_error(f"ネットワークエラー: {e}")
        except ValueError as e:
            self.debug_exception("値エラー", e)
            self.handle_error(str(e))
        except Exception as e:
            self.debug_exception("予期せぬエラー", e)
            self.handle_error(f"予期せぬエラーが発生しました: {e}")
        finally:
            elapsed_all = time.perf_counter() - start_all
            self.debug(f"総処理時間: {elapsed_all:.2f}s")

    # ==============================
    # セッション初期化（リトライ等）
    # ==============================
    def init_session(self):
        self.session = requests.Session()
        headers = {
            # 実ブラウザに近いヘッダ（過度に偽装はしない）
            'User-Agent': ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                           'AppleWebKit/537.36 (KHTML, like Gecko) '
                           'Chrome/124.0.0.0 Safari/537.36'),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        self.session.headers.update(headers)

        retry = Retry(
            total=3,
            read=3,
            connect=3,
            backoff_factor=0.6,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=frozenset(['HEAD', 'GET'])
        )
        adapter = HTTPAdapter(max_retries=retry)
        self.session.mount('https://', adapter)
        self.session.mount('http://', adapter)
        self.debug("セッション初期化完了: リトライ=3, backoff=0.6")

    # ==============================
    # 詳細情報抽出
    # ==============================
    def extract_details(self, soup):
        details = {}
        report = {"used_selectors": [], "counts": {}, "fallbacks": []}

        # 1) ラベル・値のペア (既存の方法)
        spec_wrappers = soup.select('div.detail__specs-wrapper')
        report["used_selectors"].append('div.detail__specs-wrapper .detail__specs-label/value')
        report["counts"]["detail__specs-wrapper"] = len(spec_wrappers)
        for wrapper in spec_wrappers:
            labels = wrapper.select('.detail__specs-label')
            values = wrapper.select('.detail__specs-value')
            for i in range(len(labels)):
                if i < len(values):
                    key = labels[i].get_text(strip=True)
                    value = values[i].get_text(strip=True)
                    details[key] = value

        # 2) タイトルから Year / Manufacturer / Model 推定
        title_tag = soup.select_one('h1.detail__title')
        if title_tag:
            report["used_selectors"].append('h1.detail__title')
            title_text = title_tag.get_text(strip=True)
            # 例: "1995 CATERPILLAR CH65C"
            match = re.match(r'(\d{4})\s+([A-Z][A-Za-z0-9&\-\s]+?)\s+([A-Za-z0-9\-\./]+.*)', title_text, re.IGNORECASE)
            if match:
                details.setdefault('Year', match.group(1))
                details.setdefault('Manufacturer', match.group(2).strip())
                details.setdefault('Model', match.group(3).strip())

        # 3) 価格
        price_tag = soup.select_one('strong.listing-prices__retail-price')
        if price_tag:
            report["used_selectors"].append('strong.listing-prices__retail-price')
            details['Price'] = price_tag.get_text(strip=True)

        # 4) JSON-LD (構造化データ) からの補完（フォールバック）
        json_ld = soup.select('script[type="application/ld+json"]')
        report["counts"]["ld+json"] = len(json_ld)
        for script in json_ld:
            try:
                data = json.loads(script.string.strip())
                # dataがリスト/辞書どちらでも安全に扱う
                candidates = data if isinstance(data, list) else [data]
                for obj in candidates:
                    if not isinstance(obj, dict):
                        continue
                    # ProductもしくはOffer的な情報を探索
                    if obj.get("@type") in ("Product", "Offer", "Vehicle", "CreativeWork"):
                        name = obj.get("name") or obj.get("model")
                        if name and ('Year' not in details or details.get('Year') in ('', 'N/A')):
                            m = re.search(r'(\d{4})', name)
                            if m:
                                details.setdefault('Year', m.group(1))
                        brand = obj.get("brand")
                        if isinstance(brand, dict):
                            details.setdefault('Manufacturer', brand.get("name", "N/A"))
                        elif isinstance(brand, str):
                            details.setdefault('Manufacturer', brand)
                        model = obj.get("model") or obj.get("name")
                        if model:
                            details.setdefault('Model', str(model))
                        offers = obj.get("offers")
                        if isinstance(offers, dict):
                            price = offers.get("price")
                            if price and 'Price' not in details:
                                details['Price'] = str(price)
                        report["fallbacks"].append("ld+json")
            except Exception:
                # JSON-LDが壊れていてもスキップ
                pass

        # 標準キーの既定値
        for key in ["Year", "Manufacturer", "Model", "Serial Number", "Hours", "Description", "Price"]:
            details.setdefault(key, "N/A")

        # Description（長文）は別セレクタも試す
        if details.get("Description") in ("", "N/A"):
            desc_tag = soup.select_one('.detail__description, .listing-description, div[itemprop="description"]')
            if desc_tag:
                details["Description"] = desc_tag.get_text(" ", strip=True)
                report["used_selectors"].append('.detail__description/.listing-description/[itemprop=description]')

        return details, report

    # ==============================
    # 写真URL抽出
    # ==============================
    def extract_photo_urls(self, soup):
        report = {"trials": [], "counts": {}}
        photo_urls = []

        # 1) 既存セレクタ
        sel1 = 'div.mc-items .mc-item img'
        tags1 = soup.select(sel1)
        report["trials"].append(sel1)
        report["counts"][sel1] = len(tags1)
        for tag in tags1:
            if tag.get('data-fullscreen'):
                photo_urls.append(tag['data-fullscreen'])

        # 2) 代替セレクタ（data-src / src）
        if not photo_urls:
            sel2 = 'div.mc-items img, div.gallery img, img'
            tags2 = soup.select(sel2)
            report["trials"].append(sel2)
            report["counts"][sel2] = len(tags2)
            for tag in tags2:
                for attr in ('data-fullscreen', 'data-src', 'src'):
                    val = tag.get(attr)
                    if val and val.startswith('http'):
                        photo_urls.append(val)
                        break

        # 重複排除
        photo_urls = list(dict.fromkeys(photo_urls))
        return photo_urls, report

    # ==============================
    # 保存手続き
    # ==============================
    def ask_save_location_and_proceed(self, details, photo_urls, source_url):
        parent_dir = filedialog.askdirectory(title="保存先の親フォルダを選択してください")
        if not parent_dir:
            self.update_status("処理がキャンセルされました。")
            self.reset_ui()
            return
        thread = threading.Thread(
            target=self.download_and_save,
            args=(parent_dir, details, photo_urls, source_url),
            daemon=True
        )
        thread.start()

    def download_and_save(self, parent_dir, details, photo_urls, source_url):
        try:
            model = details.get("Model", "NA").replace('/', '_').replace(' ', '_')
            serial = details.get("Serial Number", "NA").replace('/', '_').replace(' ', '_')
            manufacturer = (details.get('Manufacturer', 'NA') or 'NA').replace(' ', '_')
            base_filename = f"{manufacturer}_{model}_{serial}"

            # 画像用サブディレクトリ
            image_dir = os.path.join(parent_dir, "img")
            os.makedirs(image_dir, exist_ok=True)

            self.append_text(self.result_text, f"情報を '{parent_dir}' に保存します。\n")
            total_photos = len(photo_urls)
            self.progress_bar['maximum'] = total_photos or 1

            # 画像DL
            photo_paths = []
            for i, photo_url in enumerate(photo_urls):
                self.update_status(f"画像をダウンロード中... ({i+1}/{total_photos})")
                self.progress_bar['value'] = i + 1
                filename = f"{model}_{serial}_{i+1}.png"
                filepath = os.path.join(image_dir, filename)

                try:
                    t0 = time.perf_counter()
                    img_resp = self.session.get(photo_url, timeout=20)
                    t1 = time.perf_counter()
                    self.debug(f"[IMG GET] {photo_url} status={img_resp.status_code} time={t1 - t0:.2f}s length={len(img_resp.content)}")
                    img_resp.raise_for_status()
                    Image.open(BytesIO(img_resp.content)).save(filepath, "PNG")
                    photo_paths.append(os.path.join("img", filename))
                    self.append_text(self.result_text, f" ✓ ダウンロード完了: {filename}\n")
                except Exception as e:
                    self.append_text(self.result_text, f" ✗ 写真のダウンロード失敗: {photo_url}, Error: {e}\n")
                    self.debug_exception("画像ダウンロード失敗", e)

            # Markdown生成
            self.update_status("Markdownファイルを生成中...")
            markdown_content = self.generate_markdown(details, photo_paths, source_url)

            md_filename = os.path.join(parent_dir, f"{base_filename}.md")
            with open(md_filename, "w", encoding="utf-8") as f:
                f.write(markdown_content)

            # HTMLスナップショット（任意）：自動でも保存しておくとデバッグに便利
            if self.last_html:
                raw_html_path = os.path.join(parent_dir, f"{base_filename}_raw.html")
                with open(raw_html_path, "w", encoding="utf-8") as f:
                    f.write(self.last_html)
                self.debug(f"HTMLスナップショット保存: {raw_html_path}")

            self.update_status("全ての処理が完了しました。")
            self.append_text(self.result_text, f"\n--- ✓ 全て完了 ---\nMarkdownファイル: {md_filename}\n")
            self.append_text(self.result_text, "\n--- 生成されたMarkdown ---\n")
            self.append_text(self.result_text, markdown_content)

        except Exception as e:
            self.debug_exception("ファイル保存中のエラー", e)
            self.handle_error(f"ファイル保存中のエラー: {e}")
        finally:
            self.root.after(0, self.reset_ui)

    # ==============================
    # Markdown生成
    # ==============================
    def generate_markdown(self, details, photo_paths, source_url):
        year, manu, model = details.get("Year", "N/A"), details.get("Manufacturer", "N/A"), details.get("Model", "N/A")
        md = f"# {manu} {model} ({year})\n\n"
        md += "## 詳細情報\n"
        md += f"- **Serial Number:** {details.get('Serial Number', 'N/A')}\n"
        md += f"- **Hours:** {details.get('Hours', 'N/A')}\n"
        # md += f("- **Hours:** {hours}\n".format(hours=details.get('Hours', 'N/A')))
        md += f"- **Price:** {details.get('Price', 'N/A')}\n"
        md += f"- **Source URL:** <{source_url}>\n\n"

        md += "## Description\n"
        md += f"{details.get('Description', 'N/A')}\n\n"
        md += "## Photos\n"
        for path in photo_paths:
            md += f"![]({path.replace(os.sep, '/')})\n"
        return md

    # ==============================
    # デバッグ出力まわり
    # ==============================
    def debug(self, message: str):
        """デバッグタブにタイムスタンプ付きで出力（詳細デバッグOFF時は短い重要ログのみ）"""
        ts = datetime.now().strftime("%H:%M:%S")
        text = f"[{ts}] {message}\n"
        if self.debug_enabled.get():
            self.append_text(self.debug_text, text)
        else:
            # 重要そうな短い行だけを出す方針でも良いが、ここではOFFなら出さない
            pass

    def debug_http_response(self, method: str, resp: requests.Response, elapsed: float):
        info = {
            "method": method,
            "final_url": resp.url,
            "status": resp.status_code,
            "reason": resp.reason,
            "elapsed_sec": round(elapsed, 3),
            "encoding": resp.encoding,
            "content_length": len(resp.content) if resp.content is not None else 0,
            "request_headers": dict(resp.request.headers) if resp.request and resp.request.headers else {},
            "response_headers": dict(resp.headers) if resp.headers else {},
            "cookies": resp.cookies.get_dict() if resp.cookies else {},
        }
        self.last_response_info = info
        host = urlparse(resp.url).netloc
        self.debug(f"{method} {resp.url} [{resp.status_code} {resp.reason}] in {elapsed:.2f}s (host={host})")
        if self.debug_enabled.get():
            self.debug("レスポンス情報: " + json.dumps(info, ensure_ascii=False, indent=2))

        # 一般的なブロック兆候（参考ログ）
        if resp.status_code in (403, 429):
            self.debug("⚠ 注意: 403/429が返っています。アクセス制限や頻度制限の可能性があります。")

    def debug_exception(self, title: str, e: Exception):
        tb = traceback.format_exc()
        self.debug(f"❌ {title}: {e}")
        self.debug(tb)

    # ==============================
    # テキストウィジェット汎用
    # ==============================
    def set_text(self, widget: scrolledtext.ScrolledText, text: str, replace=False):
        def task():
            widget.config(state='normal')
            if replace:
                widget.delete(1.0, tk.END)
            widget.insert(tk.END, text)
            widget.see(tk.END)
            widget.config(state='disabled')
        self.root.after(0, task)

    def append_text(self, widget: scrolledtext.ScrolledText, text: str):
        def task():
            widget.config(state='normal')
            widget.insert(tk.END, text)
            widget.see(tk.END)
            widget.config(state='disabled')
        self.root.after(0, task)

    def update_status(self, message):
        self.root.after(0, lambda: self.status_label.config(text=message))

    def handle_error(self, message):
        self.root.after(0, lambda: messagebox.showerror("エラー", message))
        self.reset_ui()
        self.update_status("エラーが発生しました。待機状態に戻ります。")

    def reset_ui(self):
        self.scrape_button.config(state='normal')
        self.progress_bar['value'] = 0

    # ==============================
    # ログ/HTML保存ボタン
    # ==============================
    def save_debug_log(self):
        try:
            path = filedialog.asksaveasfilename(
                title="デバッグログの保存先を選択",
                defaultextension=".txt",
                filetypes=[("Text", "*.txt"), ("All Files", "*.*")]
            )
            if not path:
                return
            content = self.debug_text.get(1.0, tk.END)
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            messagebox.showinfo("保存完了", f"デバッグログを保存しました:\n{path}")
        except Exception as e:
            self.debug_exception("ログ保存エラー", e)
            messagebox.showerror("エラー", f"ログ保存中にエラー: {e}")

    def save_last_html(self):
        try:
            if not self.last_html:
                messagebox.showwarning("警告", "保存できるHTMLがまだありません。先に取得を実行してください。")
                return
            path = filedialog.asksaveasfilename(
                title="HTMLの保存先を選択",
                defaultextension=".html",
                filetypes=[("HTML", "*.html"), ("All Files", "*.*")]
            )
            if not path:
                return
            with open(path, "w", encoding="utf-8") as f:
                f.write(self.last_html)
            messagebox.showinfo("保存完了", f"HTMLを保存しました:\n{path}")
        except Exception as e:
            self.debug_exception("HTML保存エラー", e)
            messagebox.showerror("エラー", f"HTML保存中にエラー: {e}")


if __name__ == "__main__":
    root = tk.Tk()
    app = ScraperApp(root)
    root.mainloop()
