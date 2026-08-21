# あぐましん

Agricultural Maninary Repository

[AgMachine](https://agmachie-blog.vercel.app/)

gemini の力を借りています。

セキュリティも少し高めたい。

もう少し見た目もどうにかならんかな．

## GitHub メモ機能

`/notes` は GitHub 認証付きの公開メモ帳です。閲覧は `/notes` で行い、`GITHUB_ALLOWED_LOGINS` に含まれる GitHub アカウントでログインした場合だけ Markdown の作成・更新ができます。保存先は既定で `content/notes/*.md` です。

必要な環境変数:

```bash
AUTH_SECRET=任意の長いランダム文字列
GITHUB_CLIENT_ID=GitHub OAuth App の Client ID
GITHUB_CLIENT_SECRET=GitHub OAuth App の Client Secret
GITHUB_ALLOWED_LOGINS=takam1602
GITHUB_TOKEN=repo contents write 権限を持つ fine-grained personal access token
GITHUB_REPO_OWNER=takam1602
GITHUB_REPO_NAME=agmachieBlog
GITHUB_REPO_BRANCH=main
GITHUB_NOTES_PATH=content/notes
CLOUDFLARE_ACCOUNT_ID=Cloudflare Account ID
CLOUDFLARE_IMAGES_API_TOKEN=Cloudflare Images Write 権限を持つ API token
CLOUDFLARE_IMAGES_ACCOUNT_HASH=Cloudflare Images の delivery account hash
CLOUDFLARE_IMAGES_VARIANT=public
```

GitHub OAuth App の callback URL は、公開 URL に合わせて `https://example.com/api/auth/github/callback` にします。Vercel では同じ値を Project Settings の Environment Variables に登録してください。

メモ編集画面の画像追加は Cloudflare Images にアップロードし、本文には
`![alt](https://imagedelivery.net/.../public)` の Markdown を挿入します。
そのため、保存したメモ Markdown を `content/blog` に移動しても画像 URL はそのまま使えます。

