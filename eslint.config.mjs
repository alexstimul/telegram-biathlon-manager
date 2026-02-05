import js from "@eslint/js"
import tseslint from "typescript-eslint"
import prettier from "eslint-config-prettier"

export default [
    {
        ignores: ["dist/", "node_modules/"]
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["/*.ts", "/*.tsx"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname
            }
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin
        },
        rules: {
            semi: ["error", "never"],
            quotes: ["error", "double", { avoidEscape: true }],
            indent: ["error", 4, { SwitchCase: 1 }],
            "max-len": ["error", { code: 90, ignoreUrls: true, ignoreStrings: false }],
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/consistent-type-imports": "error"
        }
    },
    {
        files: ["/*.js", "/*.mjs", "**/*.cjs"],
        rules: {
            quotes: ["error", "double", { avoidEscape: true }],
            indent: ["error", 4, { SwitchCase: 1 }],
            "max-len": ["error", { code: 90, ignoreUrls: true, ignoreStrings: false }]
        }
    },
    prettier
]
