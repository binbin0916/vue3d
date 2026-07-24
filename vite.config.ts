import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		createSvgIconsPlugin({
			// 指定 SVG 图标存放目录（支持多个）
			iconDirs: [path.resolve(process.cwd(), 'src/assets/svgs')],
			// 使用 SVG 的 id 前缀（默认为 'icon'，生成的 id 格式为 'icon-xxx'）
			symbolId: 'icon-[name]',
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
});
