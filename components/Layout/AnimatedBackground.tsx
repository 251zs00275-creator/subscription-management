'use client'

import Image from 'next/image'

export function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <Image
        src="/design/academy-dashboard-bg-v2.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-100"
      />
      <div className="absolute inset-0" style={{ background: 'var(--bg-wash)' }} />
      <div className="absolute inset-y-0 left-0 w-[30rem]" style={{ background: 'var(--bg-left-fade)' }} />
      <div className="absolute inset-y-0 right-0 w-[24rem]" style={{ background: 'var(--bg-right-fade)' }} />

      {/* Academy HUD grid */}
      <div className="absolute inset-0 bg-grid opacity-35" />
      <div className="absolute left-0 top-0 h-40 w-full bg-[linear-gradient(90deg,transparent,rgba(56,189,248,0.18),transparent)]" />

      {/* Soft ambient light bands */}
      <div className="absolute inset-x-0 top-0 h-56" style={{ background: 'var(--bg-top-light)' }} />
      <div className="absolute inset-x-0 bottom-0 h-48" style={{ background: 'var(--bg-bottom-light)' }} />
    </div>
  )
}
