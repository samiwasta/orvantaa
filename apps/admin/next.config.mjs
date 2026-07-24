/**
 * Build Next.js `images.remotePatterns` for Cloudflare R2 / CDN hosts.
 * Always includes the known production CDN so Turbo/Vercel builds never ship
 * an empty allowlist when `R2_PUBLIC_URL` is missing from the task env.
 */
function r2ImageRemotePatterns(publicUrl) {
  const patterns = []
  const seen = new Set()

  const add = (value) => {
    if (!value) return
    try {
      const parsed = new URL(value.trim())
      const protocol = parsed.protocol.replace(":", "")
      if (protocol !== "https" && protocol !== "http") return
      const key = `${protocol}://${parsed.hostname}`
      if (seen.has(key)) return
      seen.add(key)
      patterns.push({
        protocol,
        hostname: parsed.hostname,
        pathname: "/**",
      })
    } catch {
      // ignore invalid URLs
    }
  }

  add(publicUrl)
  add("https://assets.orvantaa.com")

  return patterns
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@workspace/ui",
    "@workspace/transactional",
    "@workspace/storage",
    "@workspace/rich-text",
  ],
  serverExternalPackages: ["prisma", "@aws-sdk/client-s3"],
  images: {
    remotePatterns: r2ImageRemotePatterns(process.env.R2_PUBLIC_URL),
  },
}

export default nextConfig
