'use client'

import { ComponentPropsWithoutRef } from 'react'
import type { MDXComponents } from 'mdx/types'
import MarkdownImage from '@/components/MarkdownImage'

export function useMDXComponents(
  components: MDXComponents,
): MDXComponents {
  return {
    img: (props: ComponentPropsWithoutRef<'img'>) => (
      <MarkdownImage src={(props.src ?? '') as string} alt={props.alt} />
    ),
    ...components,
  }
}
