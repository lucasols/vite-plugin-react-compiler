# Vite React Compiler Plugin

A React Compiler Plugin compatible with `@vitejs/plugin-react-swc`

## Install

Install with your preferred package manager:

```bash
pnpm add @ls-stack/vite-plugin-react-compiler
```

## Usage

Add the plugin before any other plugins in your `vite.config.js`:

```js
import react from '@vitejs/plugin-react-swc'
import { viteReactCompiler } from '@ls-stack/vite-plugin-react-compiler'

export default defineConfig({
  plugins: [
    viteReactCompiler(),
    // any other plugins should go after the react compiler plugin
    react(),
  ],
})
```

## Incremental adoptions

The plugin will run by default on all `js` and `ts` files. But you can configure it to run only on specific files or files matching a pattern.

```js
export default defineConfig({
  plugins: [
    viteReactCompiler({
      includeFile: (filePath, code) => {
        // only run on files that have the react compiler lint rule enabled
        return code.includes(
          '/* eslint react-compiler/react-compiler: ["error"] */',
        )
      },
    }),
    react(),
  ],
})
```
