import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "MyInfiniteCraft - Super Fun Creative Game World",
  description:
    "Welcome to MyInfiniteCraft - Super Fun Creative Game World! Discover, combine, and create infinite possibilities! Start your magical adventure with infinite creation games!",
  keywords:
    "MyInfiniteCraft, infinite creation, kids games, creative games, puzzle games, browser games, creative games, discovery games",
  openGraph: {
    title: "MyInfiniteCraft - Super Fun Creative Game World",
    description:
      "Creativity meets infinite possibilities - discover, combine, create magical things beyond imagination!",
    type: "website",
  },
  verification: {
    google: "3ETa0kMQ4ZkLKghCCXS2Akgt1ZjLgPKbkbUznrW5zz4",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ff6b6b" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 fontSize=%2290%22>🎮</text></svg>"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
