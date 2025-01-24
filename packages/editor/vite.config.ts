import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import vueJsx from '@vitejs/plugin-vue-jsx'
import ElementPlus from 'unplugin-element-plus/vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /@\//,
        replacement: resolve(__dirname) + '/'
      },
      { find: '@components', replacement: resolve(__dirname, 'src/components') }
    ]
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: 'dist' // 设置生成文件的目录为dist
    }),
    vue(),
    vueJsx(),
    ElementPlus({}),
    visualizer({
      gzipSize: true,
      brotliSize: true,
      emitFile: false,
      filename: 'visualizer.html', // 分析图生成的文件名
      open: false // 如果存在本地服务端口，将在打包后自动展示
    })
  ],
  build: {
    sourcemap: true,
    minify: true,
    lib: {
      entry: [resolve(__dirname, 'src/index.ts')],
      formats: ['es']
    },
    rollupOptions: {
      external: ['vue']
    }
  }
})
