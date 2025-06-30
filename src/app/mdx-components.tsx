'use client'

import type { MDXComponents } from 'mdx/types'
import MarkdownImage from '@/components/MarkdownImage'

/**
 * Markdown / MDX 内の <img> タグをすべて
 * Lightbox 付きの MarkdownImage に置き換える
 */
export function useMDXComponents(
  components: MDXComponents,
): MDXComponents {
  return {
    img: (props) => <MarkdownImage {...(props as any)} />,
    ...components,
  }
}
