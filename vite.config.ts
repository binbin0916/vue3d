import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import path from 'path';

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		createSvgIconsPlugin({
			iconDirs: [path.resolve(process.cwd(), 'src/assets/svgs')],
			symbolId: 'icon-[name]',
		}),
		AutoImport({
			resolvers: [ElementPlusResolver()],
		}),
		Components({
			resolvers: [ElementPlusResolver()],
		}),
		visualizer({
			open: true,
			gzipSize: true,
			brotliSize: true,
			filename: 'dist/stats.html',
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	server: {
		host: '0.0.0.0',
		port: 3000,
	},
	build: {
		chunkSizeWarningLimit: 1000, // 阈值调高到 1MB（可选）
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						// Three.js 单独一个 chunk
						if (id.includes('three')) return 'three';
						// Vue 生态单独一个
						if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
							return 'vue-vendor';
						}
						// 其余第三方
						return 'vendor';
					}
				},
			},
		},
	},
});
