import { Inter } from "next/font/google"
import "./globals.css"
import PageViewTracker from "./components/analytics/PageViewTracker"
import { Analytics } from "@vercel/analytics/next"


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Lucas Fernández | Fullstack Developer",
  description:
    "Portafolio de Lucas Fernández: desarrollo web fullstack, proyectos y contacto.",
  icons: {
    apple: [{ url: "/Lucas.jpg", type: "image/jpeg" }],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <PageViewTracker />
        <Analytics />
        {children}
      </body>
    </html>
  )
}
