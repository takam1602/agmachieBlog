export function replaceRelativePaths(
  markdown: string,
  repoOwner: string,
  repoName: string,
  branch = 'main'
) {
  const baseRaw = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/`;
  // 画像 ![](...)
  markdown = markdown.replace(
    /!\[([^\]]*)\]\((\.?\/[^)\s]+)\)/g,
    (_m, alt, path) => `![${alt}](${path.startsWith('http') ? path : baseRaw + path.replace(/^\.\//, '')})`
  );
  // リンク [](...)
  markdown = markdown.replace(
    /\[([^\]]+)\]\((\.?\/[^)\s]+\.md)\)/g,
    (_m, text, path) => `[${text}](/view/${path.replace(/^\.\//, '').replace(/\.md$/, '')})`
  );
  return markdown;
}
