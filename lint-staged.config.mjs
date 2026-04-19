import path from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = path.dirname(fileURLToPath(import.meta.url))

function relToPackage(packageDir, files) {
  const pkgAbs = path.join(repoRoot, packageDir)
  return files.map((f) => {
    const abs = path.isAbsolute(f) ? f : path.join(repoRoot, f)
    return path.relative(pkgAbs, abs).split(path.sep).join("/")
  })
}

export default {
  "apps/dashboard/**/*.{ts,tsx}": (files) => {
    if (!files.length) return []
    const rel = relToPackage("apps/dashboard", files)
    return [
      `pnpm --filter dashboard exec eslint --fix -- ${rel.join(" ")}`,
      `pnpm exec prettier --write ${files.map((f) => JSON.stringify(f)).join(" ")}`,
    ]
  },
  "packages/ui/**/*.{ts,tsx}": (files) => {
    if (!files.length) return []
    const rel = relToPackage("packages/ui", files)
    return [
      `pnpm --filter @workspace/ui exec eslint --fix -- ${rel.join(" ")}`,
      `pnpm exec prettier --write ${files.map((f) => JSON.stringify(f)).join(" ")}`,
    ]
  },
  "*.{json,md,yml,yaml,css}": "prettier --write",
}
