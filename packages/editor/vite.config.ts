import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import vueJsx from '@vitejs/plugin-vue-jsx'

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
    vueJsx()
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: [resolve(__dirname, 'src/index.ts')],
      formats: ['es']
    },
    rollupOptions: {
      external: ['vue']
    }
  }
})
