import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

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
      rollupTypes: true,
      declarationOnly: false,
      compilerOptions: {
        declarationMap: true
      }
    })
  ],
  build: {
    sourcemap: 'inline',
    lib: {
      entry: resolve(__dirname, './src/index.ts'), // TS库入口文件
      formats: ['es'],
      fileName: 'index' // 输出的文件名
    }
  }
})
