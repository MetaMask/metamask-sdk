import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/.{idea,git,cache,output,temp}/**",
			"**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
			"**/fixtures.test.ts", // Exclude fixtures helper file
		],
		include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
	},
});
