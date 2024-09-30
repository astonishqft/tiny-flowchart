// vite.config.ts
import { defineConfig } from 'file:///Users/qifutao/Documents/workspace/ioc-editor/node_modules/.pnpm/vite@5.2.12/node_modules/vite/dist/node/index.js'
import vue from 'file:///Users/qifutao/Documents/workspace/ioc-editor/node_modules/.pnpm/@vitejs+plugin-vue@5.0.4_vite@5.2.12_vue@3.4.27/node_modules/@vitejs/plugin-vue/dist/index.mjs'
import dts from 'file:///Users/qifutao/Documents/workspace/ioc-editor/node_modules/.pnpm/vite-plugin-dts@3.9.1_typescript@5.4.2_vite@5.2.12/node_modules/vite-plugin-dts/dist/index.mjs'
import path from 'path'
var __vite_injected_original_dirname =
  '/Users/qifutao/Documents/workspace/ioc-editor/packages/editor'
var vite_config_default = defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: 'dist'
      // 设置生成文件的目录为dist
    }),
    vue()
  ],
  build: {
    outDir: 'dist',
    // 输出文件名称
    lib: {
      entry: path.resolve(__vite_injected_original_dirname, './src/index.ts'),
      // 指定组件编译入口文件
      name: 'ioc-editor',
      fileName: 'ioc-editor'
    },
    // 库编译模式配置
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
export { vite_config_default as default }
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvcWlmdXRhby9Eb2N1bWVudHMvd29ya3NwYWNlL2lvYy1lZGl0b3IvcGFja2FnZXMvZWRpdG9yXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvcWlmdXRhby9Eb2N1bWVudHMvd29ya3NwYWNlL2lvYy1lZGl0b3IvcGFja2FnZXMvZWRpdG9yL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9xaWZ1dGFvL0RvY3VtZW50cy93b3Jrc3BhY2UvaW9jLWVkaXRvci9wYWNrYWdlcy9lZGl0b3Ivdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBcbiAgcGx1Z2luczogW1xuICAgIGR0cyh7XG4gICAgICBpbnNlcnRUeXBlc0VudHJ5OiB0cnVlLFxuICAgICAgb3V0RGlyOiAnZGlzdCcgLy8gXHU4QkJFXHU3RjZFXHU3NTFGXHU2MjEwXHU2NTg3XHU0RUY2XHU3Njg0XHU3NkVFXHU1RjU1XHU0RTNBZGlzdFxuICAgIH0pLFxuICAgIHZ1ZSgpXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsIC8vIFx1OEY5M1x1NTFGQVx1NjU4N1x1NEVGNlx1NTQwRFx1NzlGMFxuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9pbmRleC50cycpLCAvLyBcdTYzMDdcdTVCOUFcdTdFQzRcdTRFRjZcdTdGMTZcdThCRDFcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcbiAgICAgIG5hbWU6ICdpb2MtZWRpdG9yJyxcbiAgICAgIGZpbGVOYW1lOiAnaW9jLWVkaXRvcidcbiAgICB9LCAvLyBcdTVFOTNcdTdGMTZcdThCRDFcdTZBMjFcdTVGMEZcdTkxNERcdTdGNkVcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAvLyBcdTc4NkVcdTRGRERcdTU5MTZcdTkwRThcdTUzMTZcdTU5MDRcdTc0MDZcdTkwQTNcdTRFOUJcdTRGNjBcdTRFMERcdTYwRjNcdTYyNTNcdTUzMDVcdThGREJcdTVFOTNcdTc2ODRcdTRGOURcdThENTZcbiAgICAgIGV4dGVybmFsOiBbJ3Z1ZSddLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIC8vIFx1NTcyOCBVTUQgXHU2Nzg0XHU1RUZBXHU2QTIxXHU1RjBGXHU0RTBCXHU0RTNBXHU4RkQ5XHU0RTlCXHU1OTE2XHU5MEU4XHU1MzE2XHU3Njg0XHU0RjlEXHU4RDU2XHU2M0QwXHU0RjlCXHU0RTAwXHU0RTJBXHU1MTY4XHU1QzQwXHU1M0Q4XHU5MUNGXG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICB2dWU6ICdWdWUnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlXLFNBQVMsb0JBQW9CO0FBQ3RZLE9BQU8sU0FBUztBQUNoQixPQUFPLFNBQVM7QUFDaEIsT0FBTyxVQUFVO0FBSGpCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBRTFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxNQUNGLGtCQUFrQjtBQUFBLE1BQ2xCLFFBQVE7QUFBQTtBQUFBLElBQ1YsQ0FBQztBQUFBLElBQ0QsSUFBSTtBQUFBLEVBQ047QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQTtBQUFBLElBQ1IsS0FBSztBQUFBLE1BQ0gsT0FBTyxLQUFLLFFBQVEsa0NBQVcsZ0JBQWdCO0FBQUE7QUFBQSxNQUMvQyxNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsSUFDWjtBQUFBO0FBQUEsSUFDQSxlQUFlO0FBQUE7QUFBQSxNQUViLFVBQVUsQ0FBQyxLQUFLO0FBQUEsTUFDaEIsUUFBUTtBQUFBO0FBQUEsUUFFTixTQUFTO0FBQUEsVUFDUCxLQUFLO0FBQUEsUUFDUDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
