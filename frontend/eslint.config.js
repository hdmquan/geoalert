import { defineConfig, globalIgnores } from "eslint/config"
import globals from "globals"
import js from "@eslint/js"
import pluginVue from "eslint-plugin-vue"
import pluginVitest from "@vitest/eslint-plugin"
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting"

export default defineConfig([
    {
        name: "app/files-to-lint",
        files: ["**/*.{js,mjs,jsx,vue}"],
        languageOptions: {
            globals: {
                ...globals.browser
            },
            parserOptions: {
                ecmaVersion: 2022 // Optional, but locks ES2022 features
            }
        },
        rules: {
            // YOUR STYLE RULES
            indent: ["error", 4],
            quotes: ["error", "double"],
            semi: ["error", "never"],
            "comma-dangle": ["error", "none"],
            "object-curly-spacing": ["error", "always"],
            "vue/html-indent": ["error", 4],
            "vue/max-attributes-per-line": ["error", { singleline: 3 }],
            "vue/singleline-html-element-content-newline": "off",
            "vue/multiline-html-element-content-newline": "off"
        }
    },

    globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**"]),

    js.configs.recommended,
    ...pluginVue.configs["flat/essential"],

    {
        ...pluginVitest.configs.recommended,
        files: ["src/**/__tests__/*"]
    },
    skipFormatting
])
