import nextTypescript from 'eslint-config-next/typescript'

/**
 * Use typescript-eslint rules from eslint-config-next.
 * next/core-web-vitals is omitted: its bundled eslint-plugin-react uses the
 * removed ESLint 10 `getFilename` API. Re-add it when the plugin is updated.
 */

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...nextTypescript,
]

export default eslintConfig
