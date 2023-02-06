/// <reference types="vitest" />

import { basename, join, relative, resolve } from 'path'
import { readdirSync, statSync } from 'fs'
import { type PluginOption, defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { chunkSplitPlugin } from 'vite-plugin-chunk-split'

const tsSuffix = '.ts'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'prod'

  const plugins: PluginOption[] = []

  if (isProd) {
    plugins.push(
      dts({}),
      chunkSplitPlugin({
        strategy: 'unbundle',
        customChunk: ({ file }) => {
          if (file.startsWith('src')) {
            return file.slice(4).replace(/\.[^.$]+$/, '')
          }
          if (file.includes('fp-ts')) {
            // console.log(file)
            return 'fp-ts'
          }
          return null
        },
      }),
    )
  }

  return {
    plugins,
    resolve: {
      alias: [
        {
          find: '@he110/utils',
          replacement: resolve(__dirname, 'src'),
        },
      ],
    },
    build: {
      emptyOutDir: false,
      outDir: 'dist',
      sourcemap: false,
      lib: {
        formats: ['cjs', 'es'],
        entry: getEntries(),
      },
      rollupOptions: {
        output: {
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      },
    },
    test: {
      include: ['src/**/*.test.ts'],
      coverage: {
        provider: 'c8',
        reporter: ['json', 'html'],
        reportsDirectory: 'coverages',
        include: [
          'src/**/*.ts',
        ],
      },
    },
  }
})

/**
 * get library entries
 */
function getEntries() {
  // get entries
  const initEntries: Record<string, string> = {}
  const sourceDirectory = getSourceDirectory()
  const modules = getModules(sourceDirectory)
  const entries = modules.reduce((obj, entryName) => {
    const relPath = relative(__dirname, sourceDirectory)
    obj[entryName] = join(relPath, entryName + tsSuffix)
    return obj
  }, initEntries)

  return entries
}

function getSourceDirectory() {
  return resolve(__dirname, 'src')
}

function getModules(directory: string) {
  return readdirSync(directory)
    .filter((filename) => {
      const fullPath = resolve(directory, filename)
      const stat = statSync(fullPath)
      return stat.isFile()
    })
    .map(filename => basename(filename, tsSuffix))
}
