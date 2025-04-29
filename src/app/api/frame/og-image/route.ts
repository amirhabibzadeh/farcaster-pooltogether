import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
    try {
        const imageUrl = new URL('/og-image.png', process.env.NEXT_PUBLIC_APP_URL || req.url)
        const image = await fetch(imageUrl).then((res) => res.arrayBuffer())

        return new Response(image, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, immutable, no-transform, max-age=300',
                'Access-Control-Allow-Origin': '*',
            },
        })
    } catch (e) {
        console.error('Failed to generate frame image:', e)
        return new Response('Failed to generate frame image', { status: 500 })
    }
} 