import { transformAsync } from '@babel/core'
import { createFilter, Plugin } from 'vite'
// @ts-ignore
import babelPluginReactCompiler from 'babel-plugin-react-compiler'

type Options = {
  exclude?: string | RegExp | (string | RegExp)[]
  includeFile?: (filePath: string, code: string) => boolean
  babelConfig?: string
  root?: string
  reactCompilerConfig?: {
    target?: '18' | '17' | '19'
  }
}

export function viteReactCompiler({
  babelConfig: babelConfigPath,
  root,
  reactCompilerConfig,
  includeFile,
  exclude,
}: Options = {}): Plugin {
  let projectRoot = process.cwd()
  const tsRE = /\.tsx?$/
  const defaultIncludeRE = /\.[tj]sx?$/

  const defaultFilter = createFilter(defaultIncludeRE, exclude)

  return {
    name: 'vite-react-compiler',
    enforce: 'pre',
    configResolved(config) {
      projectRoot = root || config.root
    },
    async transform(code, id) {
      if (id.includes('/node_modules/')) return

      if (!defaultFilter(id)) return

      const [filepath] = id.split('?')

      if (!filepath) return

      if (includeFile && !includeFile(filepath, code)) return

      const parserPlugins: ('jsx' | 'typescript')[] = []

      if (!filepath.endsWith('.ts')) {
        parserPlugins.push('jsx')
      }

      if (tsRE.test(filepath)) {
        parserPlugins.push('typescript')
      }

      const result = await transformAsync(code, {
        babelrc: false,
        configFile: babelConfigPath,
        root: projectRoot,
        filename: id,
        sourceFileName: filepath,
        parserOpts: {
          sourceType: 'module',
          allowAwaitOutsideFunction: true,
          plugins: parserPlugins,
        },
        generatorOpts: {
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
