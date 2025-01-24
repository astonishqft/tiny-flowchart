import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [
    dts({
      outDir: ['dist'],
      staticImport: true,
      // insertTypesEntry: true,
      rollupTypes: true,
      declarationOnly: false,
      compilerOptions: {
        declarationMap: true
      }
    }),
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
    lib: {
      entry: resolve(__dirname, './src/index.ts'), // TS库入口文件
      formats: ['es'],
      fileName: 'index' // 输出的文件名
    }
  }
})
