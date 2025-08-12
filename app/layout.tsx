import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "MyInfiniteCraft - 超级好玩的创造游戏世界",
  description:
    "欢迎来到MyInfiniteCraft - 超级好玩的创造游戏世界！在这里你可以发现、组合、创造无限可能！和无限创造游戏一起开始你的神奇冒险吧！",
  keywords: "MyInfiniteCraft, 无限创造, 儿童游戏, 创造游戏, 益智游戏, 浏览器游戏, 创意游戏, 发现游戏",
  openGraph: {
    title: "MyInfiniteCraft - 超级好玩的创造游戏世界",
    description: "创造力遇见无限可能 - 发现、组合、创造超越想象的神奇事物！",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
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
