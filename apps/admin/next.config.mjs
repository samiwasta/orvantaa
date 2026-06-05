/** @param {string | undefined} publicUrl */
function r2ImageRemotePatterns(publicUrl) {
  if (!publicUrl) return []
  try {
    const parsed = new URL(publicUrl)
    const protocol = parsed.protocol.replace(":", "")
    if (protocol !== "https" && protocol !== "http") return []
    return [
      {
        protocol,
        hostname: parsed.hostname,
        pathname: "/**",
      },
    ]
  } catch {
    return []
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@workspace/ui",
    "@workspace/transactional",
    "@workspace/storage",
    "@workspace/rich-text",
  ],
  serverExternalPackages: ["@prisma/client", "prisma", "@aws-sdk/client-s3"],
  images: {
    remotePatterns: r2ImageRemotePatterns(process.env.R2_PUBLIC_URL?.trim()),
  },
}

export default nextConfig
