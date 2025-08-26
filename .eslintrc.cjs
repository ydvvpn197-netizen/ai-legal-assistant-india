/* eslint-env node */
module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
	rules: {
		"@typescript-eslint/no-unused-vars": [
			"warn",
			{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
		],
		"@typescript-eslint/no-explicit-any": "off",
	},
	overrides: [
		{
			files: ["apps/web/**/*.{ts,tsx}", "apps/admin/**/*.{ts,tsx}"],
			extends: ["next/core-web-vitals"],
		},
	],
	env: { node: true, es2022: true, browser: true },
};
