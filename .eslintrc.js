module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["react", "next"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:next/recommended",
        'prettier',
        'prettier/@typescript-eslint',
        'prettier/react',
        'prettier/next'
    ],
    rules: {
        'prettier/prettier': 'error'
    },
    settings: {
        react: {
            version: "detect",
        },
    },
};
