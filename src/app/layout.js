import { Inter } from "next/font/google"
import "./globals.css"
import PageViewTracker from "./components/analytics/PageViewTracker"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Lucas Fernández | Fullstack Developer",
  description:
    "Portafolio de Lucas Fernández: desarrollo web fullstack, proyectos y contacto.",
  icons: {
    icon: [{ url: "/Lucas.jpg", type: "image/jpeg" }],
    apple: [{ url: "/Lucas.jpg", type: "image/jpeg" }],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <PageViewTracker />
        {children}
      </body>
    </html>
  )
}
