'use client'

import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import MarkdownImage from '@/components/MarkdownImage'

type MDXComponents = {
  img?: (props: ComponentPropsWithoutRef<'img'>) => ReactElement
  [key: string]: unknown
}

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
