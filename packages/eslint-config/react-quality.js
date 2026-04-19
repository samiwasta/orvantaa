/**
 * React structure and runtime-efficiency rules (JSX/TSX).
 * Used by Next.js app config and the internal React package config.
 *
 * @type {import("eslint").Linter.Config}
 */
export const reactQuality = {
  files: ["**/*.{jsx,tsx}"],
  rules: {
    "react/jsx-no-useless-fragment": "warn",
    "react/no-unstable-nested-components": "warn",
    "react/self-closing-comp": "warn",
    "react/no-array-index-key": "warn",
    "react/no-danger": "warn",
    "react/jsx-no-constructed-context-values": "warn",
    "react/jsx-no-leaked-render": "warn",
  },
}
