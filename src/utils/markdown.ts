/**
 * GitHub API から取得した Markdown 内の相対画像パス(./img/xxx.jpg 等)を
 * raw.githubusercontent.com の絶対 URL に置換する関数
 */
export function replaceRelativeImagePaths(
  markdown: string,
  repoOwner: string,
  repoName: string,
  branch = 'main'
): string {
  // 例: ![](./img/1.jpg) または ![alt](img/1.jpg)
  const imagePattern =
    /!\[([^\]]*)\]\((?:\.?\/)?([^)\s]+)\s*\)/g; // キャプチャ1 alt, キャプチャ2 path
  const base =
    `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/`;

  return markdown.replace(imagePattern, (_match, alt, path) => {
    // 既に http ならそのまま
    if (path.startsWith('http')) return `![${alt}](${path})`;
    return `![${alt}](${base}${path.replace(/^\.\//, '')})`;
  });
}
