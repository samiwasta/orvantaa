import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")

function walk(dir, matcher, results = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === "dist") continue
    const fullPath = path.join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      walk(fullPath, matcher, results)
    } else if (matcher(fullPath)) {
      results.push(fullPath)
    }
  }
  return results
}

const SKIP_FILES = new Set([
  "apps/admin/features/sidebar/model/navigation.ts",
  "apps/dashboard/features/sidebar/model/navigation.ts",
  "apps/admin/app/layout.tsx",
  "apps/dashboard/app/layout.tsx",
  "packages/ui/src/icons/catalog.tsx",
  "packages/ui/src/icons/index.ts",
  "packages/ui/src/icons/create-icon.tsx",
  "packages/ui/src/icons/iconly-provider.tsx",
  "packages/ui/src/icons/loader.tsx",
  "packages/ui/src/icons/types.ts",
])

const importRegex =
  /import\s+(type\s+)?\{([^}]+)\}\s+from\s+["']@workspace\/ui\/icons["'];?/g

function normalizePath(filePath) {
  return path.relative(root, filePath).split(path.sep).join("/")
}

function splitSpecifiers(raw) {
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
}

function isTypeOnlySpecifier(spec) {
  return spec.startsWith("type ")
}

function buildLucideImport(typeSpecs, valueSpecs) {
  const lines = []
  if (typeSpecs.length > 0) {
    lines.push(`import type { ${typeSpecs.join(", ")} } from "lucide-react"`)
  }
  if (valueSpecs.length > 0) {
    lines.push(`import { ${valueSpecs.join(", ")} } from "lucide-react"`)
  }
  return lines.join("\n")
}

const searchRoots = [
  "apps/dashboard",
  "apps/admin",
  "packages/rich-text",
  "packages/ui/src/components",
]

let updated = 0

for (const searchRoot of searchRoots) {
  const absoluteRoot = path.join(root, searchRoot)
  const files = walk(absoluteRoot, (filePath) => /\.(ts|tsx)$/.test(filePath))

  for (const filePath of files) {
    const rel = normalizePath(filePath)
    if (SKIP_FILES.has(rel)) continue

    let content = readFileSync(filePath, "utf8")
    if (!content.includes('@workspace/ui/icons')) continue

    const matches = [...content.matchAll(importRegex)]
    if (matches.length === 0) continue

    const typeSpecs = []
    const valueSpecs = []

    for (const match of matches) {
      const isTypeImport = Boolean(match[1])
      const specifiers = splitSpecifiers(match[2])

      for (const spec of specifiers) {
        if (spec === "AppIconlyProvider" || spec === "IconlyProvider") continue
        if (isTypeImport || isTypeOnlySpecifier(spec)) {
          typeSpecs.push(spec.replace(/^type\s+/, "").trim())
        } else {
          valueSpecs.push(spec)
        }
      }
    }

    if (typeSpecs.length === 0 && valueSpecs.length === 0) continue

    content = content.replace(importRegex, "")
    const lucideImport = buildLucideImport(
      [...new Set(typeSpecs)],
      [...new Set(valueSpecs)]
    )

    const lines = content.split("\n")
    let lastImportIndex = -1
    for (let i = 0; i < lines.length; i++) {
      if (/^import\s/.test(lines[i])) lastImportIndex = i
    }

    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, lucideImport)
    } else {
      lines.unshift(lucideImport)
    }

    content = lines
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^\n+/, "")

    writeFileSync(filePath, content)
    updated++
    console.log(`updated ${rel}`)
  }
}

console.log(`\nDone. Updated ${updated} files.`)
