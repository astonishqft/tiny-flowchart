import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import path from 'path'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: 'dist' // 设置生成文件的目录为dist
    }),
    vue()
  ],
  build: {
    outDir: 'dist', // 输出文件名称
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'), // 指定组件编译入口文件
      formats: ['cjs', 'es']
    }, // 库编译模式配置
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
