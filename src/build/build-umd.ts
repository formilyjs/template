import typescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import injectProcessEnv from 'rollup-plugin-inject-process-env'
import postcss from 'rollup-plugin-postcss'
import NpmImport from 'less-plugin-npm-import'
import ignoreImport from 'rollup-plugin-ignore-import'
import externalGlobals from 'rollup-plugin-external-globals'
import { OutputOptions, rollup, RollupOptions } from 'rollup'
import { terser } from 'rollup-plugin-terser'
import { paramCase } from 'param-case'
import { pascalCase } from 'pascal-case'
import { pkg } from './constants'

const parseName = () => {
  const name = String(pkg?.name || '')
  const scope = paramCase(name.match(/@([^\/]+)\//)?.[1])
  const moduleName = paramCase(name.replace(/@[^\/]+\//, ''))
  const filename = scope ? `${scope}.${moduleName}` : moduleName
  const rootName = scope
    ? `${pascalCase(scope)}.${pascalCase(moduleName)}`
    : pascalCase(moduleName)
  return { name, filename, scope, moduleName, rootName }
}

const buildAll = async (inputs: RollupOptions[]) => {
  for (let input of inputs) {
    const { output, ...options } = input
    const bundle = await rollup(options)
    await bundle.write(output as OutputOptions)
    await bundle.close()
  }
}

const presets = () => {
  const externals = {
    antd: 'Antd',
    vue: 'Vue',
    react: 'React',
    moment: 'moment',
    'react-is': 'ReactIs',
    '@alifd/next': 'Next',
    'react-dom': 'ReactDOM',
    'element-ui': 'Element',
    '@ant-design/icons': 'icons',
    '@vue/composition-api': 'VueCompositionAPI',
    '@formily/reactive-react': 'Formily.ReactiveReact',
    '@formily/reactive-vue': 'Formily.ReactiveVue',
    '@formily/reactive': 'Formily.Reactive',
    '@formily/path': 'Formily.Path',
    '@formily/shared': 'Formily.Shared',
    '@formily/validator': 'Formily.Validator',
    '@formily/core': 'Formily.Core',
    '@formily/json-schema': 'Formily.JSONSchema',
    '@formily/react': 'Formily.React',
    '@formily/vue': 'Formily.Vue',
  }
  return [
    typescript({
      tsconfig: './tsconfig.build.json',
      tsconfigOverride: {
        compilerOptions: {
          module: 'ESNext',
          declaration: false,
        },
      },
    }),
    resolve(),
    commonjs(),
    externalGlobals(externals, {
      exclude: ['**/*.{less,sass,scss}'],
    }),
  ]
}

const createEnvPlugin = (env = 'development') => {
  return injectProcessEnv(
    {
      NODE_ENV: env,
    },
    {
      exclude: '**/*.{css,less,sass,scss}',
      verbose: false,
    }
  )
}

export const buildUmd = async () => {
  const { name, filename, moduleName, rootName } = parseName()
  await buildAll([
    {
      input: 'src/style.ts',
      output: {
        format: 'umd',
        file: `dist/${filename}.umd.development.js`,
        name: rootName,
        sourcemap: true,
        amd: {
          id: name,
        },
      },
      external: ['react', 'react-dom', 'react-is'],
      plugins: [
        ...presets(),
        ignoreImport({
          extensions: ['.scss', '.css', '.less'],
          body: 'export default undefined;',
        }),
        createEnvPlugin(),
      ],
    },
    {
      input: 'src/style.ts',
      output: {
        format: 'umd',
        file: `dist/${filename}.umd.production.js`,
        name: rootName,
        sourcemap: true,
        amd: {
          id: name,
        },
      },
      external: ['react', 'react-dom', 'react-is'],
      plugins: [
        ...presets(),
        terser(),
        postcss({
          extract: `dist/${moduleName}.css`,
          minimize: true,
          sourceMap: true,
          use: {
            less: {
              plugins: [new NpmImport({ prefix: '~' })],
              javascriptEnabled: true,
            },
            sass: {},
            stylus: {},
          },
        }),
        createEnvPlugin('production'),
      ],
    },
  ])
}
