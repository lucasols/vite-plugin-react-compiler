import type { TransformOptions } from '@babel/core'
import { transformAsync } from '@babel/core'
import { Plugin } from 'vite'
// @ts-ignore
import babelPluginReactCompiler from 'babel-plugin-react-compiler'

type Options = {
  babelConfig?: string
  root?: string
  filterFile?: (filepath: string, code: string) => boolean
  reactCompilerConfig?: {
    target?: '18' | '17' | '19'
  }
}

export function viteReactCompiler({
  babelConfig: babelConfigPath,
  root,
  reactCompilerConfig,
  filterFile,
}: Options = {}): Plugin {
  let projectRoot = process.cwd()
  const tsRE = /\.tsx?$/

  return {
    name: 'vite-react-compiler',
    enforce: 'pre',
    configResolved(config) {
      projectRoot = root || config.root
    },
    async transform(code, id) {
      if (id.includes('/node_modules/')) return

      const babelOptions: TransformOptions = {
        babelrc: false,
        configFile: babelConfigPath,
        plugins: [],
      }

      const [filepath] = id.split('?')

      if (!filepath) return

      if (filterFile && !filterFile(filepath, code)) return

      const parserPlugins: ('jsx' | 'typescript')[] = []

      if (!filepath.endsWith('.ts')) {
        parserPlugins.push('jsx')
      }

      if (tsRE.test(filepath)) {
        parserPlugins.push('typescript')
      }

      const result = await transformAsync(code, {
        ...babelOptions,
        root: projectRoot,
        filename: id,
        sourceFileName: filepath,
        parserOpts: {
          ...babelOptions.parserOpts,
          sourceType: 'module',
          allowAwaitOutsideFunction: true,
          plugins: parserPlugins,
        },
        generatorOpts: {
          ...babelOptions.generatorOpts,
          decoratorsBeforeExport: true,
        },
        plugins: [[babelPluginReactCompiler, reactCompilerConfig]],
        sourceMaps: true,
      })

      if (result) {
        let code = result.code!

        return { code, map: result.map }
      }

      return
    },
  }
}
