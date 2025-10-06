'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      {...props}
      onThemeChange={(theme) => {
        // Handle custom "original" theme
        if (theme === 'original') {
          document.documentElement.classList.add('original')
          document.documentElement.classList.remove('dark', 'light')
        } else {
          document.documentElement.classList.remove('original')
        }
      }}
    >
      {children}
    </NextThemesProvider>
  )
}
