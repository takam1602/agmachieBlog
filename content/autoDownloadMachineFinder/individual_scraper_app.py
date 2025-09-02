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

class ScraperApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Machinery Trader Scraper v6.0")
        self.root.geometry("800x700")
        self.setup_ui()

    def setup_ui(self):
        """GUIウィジェットの初期化と配置"""
        url_frame = tk.Frame(self.root, pady=10)
        url_frame.pack(fill=tk.X, padx=10)
        tk.Label(url_frame, text="URL:", width=5).pack(side=tk.LEFT)
        self.url_entry = tk.Entry(url_frame)
        self.url_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        self.scrape_button = tk.Button(url_frame, text="データを取得", command=self.start_scraping_thread)
        self.scrape_button.pack(side=tk.RIGHT)

        result_frame = tk.Frame(self.root, pady=5)
        result_frame.pack(fill=tk.BOTH, expand=True, padx=10)
        self.result_text = scrolledtext.ScrolledText(result_frame, wrap=tk.WORD, state='disabled', height=10)
        self.result_text.pack(fill=tk.BOTH, expand=True)

        status_frame = ttk.Frame(self.root, padding="5 10 5 10")
        status_frame.pack(fill=tk.X)
        self.status_label = ttk.Label(status_frame, text="待機中...")
        self.status_label.pack(fill=tk.X)
        self.progress_bar = ttk.Progressbar(status_frame, orient='horizontal', mode='determinate')
        self.progress_bar.pack(fill=tk.X, pady=(5, 0))

    def start_scraping_thread(self):
        """ スクレイピング処理を別スレッドで開始する """
        url = self.url_entry.get().strip()
        if not url.startswith("https://www.machinerytrader.com"):
            messagebox.showwarning("警告", "有効な Machinery Trader のURLを入力してください。")
            return

        self.scrape_button.config(state='disabled')
        self.progress_bar['value'] = 0
        self.update_status("処理を開始します...")
        self.result_text.config(state='normal')
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(tk.END, f"処理中のURL: {url}\n\n")
        self.result_text.config(state='disabled')

        thread = threading.Thread(target=self.run_scraping_task, args=(url,), daemon=True)
        thread.start()

    def run_scraping_task(self, url):
        """ Webページからデータを取得し、保存する一連のタスク """
        try:
            self.update_status("Webページから情報を取得中...")
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            self.update_status("詳細情報を解析中...")
            details = self.extract_details(soup)
            
            required_keys = ["Year", "Manufacturer", "Model"]
            missing_keys = [key for key in required_keys if not details.get(key) or details[key] == "N/A"]
            if missing_keys:
                raise ValueError(f"ページの基本情報(年/メーカー/モデル)が取得できませんでした: {', '.join(missing_keys)}")

            self.update_status("写真のURLを解析中...")
            photo_tags = soup.select('div.mc-items .mc-item img')
            photo_urls = [tag['data-fullscreen'] for tag in photo_tags if tag.get('data-fullscreen')]
            
            if not photo_urls:
                self.update_result_text("警告: 写真が見つかりませんでした。\n")

            self.root.after(0, self.ask_save_location_and_proceed, details, photo_urls, url)

        except requests.exceptions.RequestException as e:
            self.handle_error(f"ネットワークエラー: {e}")
        except ValueError as e:
            self.handle_error(str(e))
        except Exception as e:
            self.handle_error(f"予期せぬエラーが発生しました: {e}")

    def extract_details(self, soup):
        """ BeautifulSoupオブジェクトから詳細情報を抽出する """
        details = {}

        spec_wrappers = soup.select('div.detail__specs-wrapper')
        for wrapper in spec_wrappers:
            labels = wrapper.select('.detail__specs-label')
            values = wrapper.select('.detail__specs-value')
            for i in range(len(labels)):
                if i < len(values):
                    key = labels[i].get_text(strip=True)
                    value = values[i].get_text(strip=True)
                    details[key] = value

        title_tag = soup.select_one('h1.detail__title')
        if title_tag:
            title_text = title_tag.get_text(strip=True)
            match = re.match(r'(\d{4})\s+([A-Z\s]+?)\s+([A-Z0-9\-\/]+.*)', title_text, re.IGNORECASE)
            if match:
                details.setdefault('Year', match.group(1))
                details.setdefault('Manufacturer', match.group(2).strip())
                details.setdefault('Model', match.group(3).strip())
        
        # --- 追加点: 価格を取得 ---
        price_tag = soup.select_one('strong.listing-prices__retail-price')
        if price_tag:
            details['Price'] = price_tag.get_text(strip=True)

        for key in ["Year", "Manufacturer", "Model", "Serial Number", "Hours", "Description", "Price"]:
            details.setdefault(key, "N/A")

        return details

    def ask_save_location_and_proceed(self, details, photo_urls, source_url):
        parent_dir = filedialog.askdirectory(title="保存先の親フォルダを選択してください")
        if not parent_dir:
            self.update_status("処理がキャンセルされました。")
            self.reset_ui()
            return
        thread = threading.Thread(target=self.download_and_save, args=(parent_dir, details, photo_urls, source_url), daemon=True)
        thread.start()

    def download_and_save(self, parent_dir, details, photo_urls, source_url):
        """ 画像とMarkdownを指定されたディレクトリ構造で保存する """
        try:
            model = details.get("Model", "NA").replace('/', '_').replace(' ', '_')
            serial = details.get("Serial Number", "NA").replace('/', '_').replace(' ', '_')
            manufacturer = details.get('Manufacturer', 'NA').replace(' ', '_')
            
            base_filename = f"{manufacturer}_{model}_{serial}"
            
            # --- 変更点: 画像用のサブディレクトリを作成 ---
            image_dir = os.path.join(parent_dir, "img")
            os.makedirs(image_dir, exist_ok=True)
            
            self.update_result_text(f"情報を '{parent_dir}' に保存します。\n")
            
            photo_paths = []
            total_photos = len(photo_urls)
            self.progress_bar['maximum'] = total_photos or 1

            for i, photo_url in enumerate(photo_urls):
                self.update_status(f"画像をダウンロード中... ({i+1}/{total_photos})")
                self.progress_bar['value'] = i + 1
                try:
                    filename = f"{model}_{serial}_{i+1}.png"
                    # --- 変更点: 保存先を 'img' ディレクトリに ---
                    filepath = os.path.join(image_dir, filename)
                    
                    img_response = requests.get(photo_url, timeout=10)
                    img_response.raise_for_status()
                    Image.open(BytesIO(img_response.content)).save(filepath, "PNG")
                    
                    # --- 変更点: Markdown用の相対パスを保存 ---
                    photo_paths.append(os.path.join("img", filename))
                    self.update_result_text(f" ✓ ダウンロード完了: {filename}\n")
                except Exception as e:
                    self.update_result_text(f" ✗ 写真のダウンロード失敗: {photo_url}, Error: {e}\n")

            self.update_status("Markdownファイルを生成中...")
            markdown_content = self.generate_markdown(details, photo_paths, source_url)
            
            # --- 変更点: MDファイルを親ディレクトリに保存 ---
            md_filename = os.path.join(parent_dir, f"{base_filename}.md")
            with open(md_filename, "w", encoding="utf-8") as f: f.write(markdown_content)
            
            self.update_status("全ての処理が完了しました。")
            self.update_result_text(f"\n--- ✓ 全て完了 ---\nMarkdownファイル: {md_filename}\n")
            self.update_result_text("\n--- 生成されたMarkdown ---\n")
            self.update_result_text(markdown_content)

        except Exception as e:
            self.handle_error(f"ファイル保存中のエラー: {e}")
        finally:
            self.root.after(0, self.reset_ui)

    def generate_markdown(self, details, photo_paths, source_url):
        """ PriceとSource URLを含むMarkdownを生成 """
        year, manu, model = details.get("Year", "N/A"), details.get("Manufacturer", "N/A"), details.get("Model", "N/A")
        md = f"# {manu} {model} ({year})\n\n"
        md += "## 詳細情報\n"
        md += f"- **Serial Number:** {details.get('Serial Number', 'N/A')}\n"
        md += f"- **Hours:** {details.get('Hours', 'N/A')}\n"
        # --- 追加点: PriceとSource URL ---
        md += f"- **Price:** {details.get('Price', 'N/A')}\n"
        md += f"- **Source URL:** <{source_url}>\n\n"
        
        md += "## Description\n"
        md += f"{details.get('Description', 'N/A')}\n\n"
        md += "## Photos\n"
        for path in photo_paths:
            # OSのパス区切り文字(\)をURL形式(/)に統一
            md += f"![]({path.replace(os.sep, '/')})\n"
        return md

    def update_status(self, message):
        self.root.after(0, lambda: self.status_label.config(text=message))

    def update_result_text(self, text):
        def task():
            self.result_text.config(state='normal')
            self.result_text.insert(tk.END, text)
            self.result_text.see(tk.END)
            self.result_text.config(state='disabled')
        self.root.after(0, task)

    def handle_error(self, message):
        self.root.after(0, lambda: messagebox.showerror("エラー", message))
        self.reset_ui()
        self.update_status("エラーが発生しました。待機状態に戻ります。")

    def reset_ui(self):
        self.scrape_button.config(state='normal')
        self.progress_bar['value'] = 0

if __name__ == "__main__":
    root = tk.Tk()
    app = ScraperApp(root)
    root.mainloop()
