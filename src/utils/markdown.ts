/**
 * Markdown 内の相対画像・相対リンクをローカル /docs/ 参照に変換
 * （GitHub 取得はやめる方針なので相対リンクのみ対応）
 */
export function replaceRelativePaths(md: string) {
  // ./img/xxx.jpg → /img/xxx.jpg
  md = md.replace(/!\[([^\]]*)\]\((\.?\/[^)\s]+)\)/g,
    (_m, alt, p) => `![${alt}](${p.replace(/^\.\//, '/')})`
  )

  // ./ag/xxx/README.md → /docs/ag/xxx/README
  md = md.replace(/\[([^\]]+)\]\((\.?\/[^)\s]+?\.md)\)/g,
    (_m, text, p) => `[${text}](/docs/${p.replace(/^\.\//, '').replace(/\.md$/, '')})`
  )

  return md
}
