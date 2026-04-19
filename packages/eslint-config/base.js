import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import onlyWarn from "eslint-plugin-only-warn"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
    },
  },
  {
    rules: {
      eqeqeq: ["warn", "always", { null: "ignore" }],
      "no-var": "warn",
      "prefer-const": "warn",
      "object-shorthand": ["warn", "always"],
      "prefer-template": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-else-return": ["warn", { allowElseIf: false }],
      "no-useless-return": "warn",
      "no-useless-rename": "warn",
      "prefer-object-spread": "warn",
      curly: ["warn", "multi-line"],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "no-duplicate-imports": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-import-type-side-effects": "warn",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-misused-promises": [
        "warn",
        { checksVoidReturn: { attributes: true } },
      ],
      "@typescript-eslint/await-thenable": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": [
        "warn",
        { ignorePrimitives: { string: true, number: true, boolean: true } },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/restrict-template-expressions": [
        "warn",
        { allowNumber: true },
      ],
    },
  },
  {
    ignores: ["dist/**", ".next/**", "**/.turbo/**", "**/coverage/**"],
  },
]
