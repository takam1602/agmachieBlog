'use client'

import { MDXProvider } from '@mdx-js/react'
import { useMDXComponents } from './mdx-components'

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MDXProvider components={useMDXComponents({})}>
      {children}
    </MDXProvider>
  )
}
