/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/transactional"],
  serverExternalPackages: ["@prisma/client", "prisma"],
}

export default nextConfig
