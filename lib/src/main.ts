import MagicString from 'magic-string'
import { Plugin } from 'vite'
import { murmur2 } from './hash'

export function ViteStableId(): Plugin {
  let isDev = false

  const virtualModuleId = 'virtual:stable-id'

  const resolvedModuleId = `\0${virtualModuleId}`

  return {
    name: 'vite-react-compiler',
    enforce: 'pre',
    configResolved(config) {
      isDev = config.command === 'serve'
    },
    resolveId(id) {
      return id === virtualModuleId ? resolvedModuleId : undefined
    },
    load(id) {
      if (id === resolvedModuleId) {
        return `export function stableId() { throw new Error('This function should not be called') }`
      }

      return undefined
    },
    transform(code, id) {
      if (code.includes(virtualModuleId) && code.includes(`stableId(`)) {
        return replaceStableIdCalls(code, id, isDev)
      }

      return undefined
    },
  }
}

export function replaceStableIdCalls(
  code: string,
  moduleId: string,
  isDev: boolean,
): { code: string; map?: any } {
  const stableIdRegex = /stableId\((?:(?:"|')([A-Za-z-0-9_]+)(?:"|'))?\)/g

  const moduleStableId = murmur2(moduleId)

  const s = new MagicString(code)

  let occurrences = 0

  s.replace(stableIdRegex, (_, m) => {
    occurrences++

    if (!isDev) return `'${moduleStableId}${occurrences}'`

    return `'s${moduleStableId}${occurrences}${m ? `-${m}` : ''}'`
  })

  const newCode = s.toString()

  if (newCode.includes('stableId(')) {
    throw new Error(
      "Failed to replace all stableId() calls, check if you are using invalid labels, labels should contain only letters, number,`-` and `_`. Invalid examples: like `stableId('')` or `stableId('fo ds')`",
    )
  }

  return { code: newCode, map: s.generateMap() }
}
