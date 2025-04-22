import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import vueJsx from '@vitejs/plugin-vue-jsx'
import ElementPlus from 'unplugin-element-plus/vite'

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
    ElementPlus({})
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
  },
  define: {
    __IOC_EDITOR_VERSION__: JSON.stringify(require('./package.json').version)
  }
})
