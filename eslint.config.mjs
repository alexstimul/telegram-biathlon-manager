import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ["dist/**", "node_modules/**"],
    },
    {
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            quotes: ["error", "double", { avoidEscape: true }],
            indent: ["error", 4, { SwitchCase: 1 }],
            "max-len": ["error", { code: 90, ignoreUrls: true, ignoreStrings: true }],
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/consistent-type-imports": "error",
        },
    },
    prettier,
];
