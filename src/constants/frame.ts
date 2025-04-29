export const frameConfig = {
    version: "next",
    imageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pt-og-image.png`,
    button: {
        title: "PoolTogether Farcaster Mini App",
        action: {
            type: "launch_frame",
            url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            name: "PoolTogether",
            splashImageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pooltogetherLogo.svg`,
            splashBackgroundColor: "#1a1a1a"
        }
    }
} 