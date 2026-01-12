import './globals.css'

export const metadata = {
    title: 'PGD PROJECT BY: Faith Udoka',
    subtitle: 'A PGD Project',
    description: 'AI-powered fake comment detection using OpenRouter API',

}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
