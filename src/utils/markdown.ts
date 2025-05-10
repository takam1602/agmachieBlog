export function replaceRelativePaths(md: string, owner: string, repo: string, branch = 'main') {
  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;

  // 画像
  md = md.replace(/!\[([^\]]*)\]\((\.?\/[^)\s]+)\)/g,
    (_m, alt, p) => `![${alt}](${p.startsWith('http') ? p : rawBase + p.replace(/^\.\//, '')})`
  );

  // .md リンクを /view/ に
  md = md.replace(/\[([^\]]+)\]\((\.?\/[^)\s]+?\.md)\)/g,
    (_m, text, p) => `[${text}](/view/${p.replace(/^\.\//, '').replace(/\.md$/, '')})`
  );

  return md;
}
