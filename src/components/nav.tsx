'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/activities', label: 'Activities' },
  { href: '/coach', label: 'Coach' },
  { href: '/race-goal', label: 'Race Goal' },
  { href: '/weekly-brief', label: 'Weekly Brief' },
] as const

export function Nav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop nav */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Wordmark */}
          <Link
            href="/dashboard"
            className="text-lg font-bold tracking-tight text-primary transition-opacity hover:opacity-80"
          >
            Pacer
          </Link>

          {/* Desktop links */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm transition-colors',
                    active
                      ? 'bg-primary/15 font-semibold text-primary ring-1 ring-inset ring-primary/30'
                      : 'font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="border-t border-border bg-background px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-primary/15 font-semibold text-primary ring-1 ring-inset ring-primary/30'
                        : 'font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                    )}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
