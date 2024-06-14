import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: 'dist' // 设置生成文件的目录为dist
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'), // TS库入口文件
      name: 'ioc-editor-core', // 挂载到全局的变量名，CDN导入的时候可以直接使用Counter变量
      fileName: 'index' // 输出的文件名
    }
  }
})
