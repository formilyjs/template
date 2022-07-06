import typescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import injectProcessEnv from 'rollup-plugin-inject-process-env'
import postcss from 'rollup-plugin-postcss'
import NpmImport from 'less-plugin-npm-import'
import ignoreImport from 'rollup-plugin-ignore-import'
import externalGlobals from 'rollup-plugin-external-globals'
import dts from 'rollup-plugin-dts'
import css from 'rollup-plugin-import-css'
import { OutputOptions, rollup, RollupOptions } from 'rollup'
import { terser } from 'rollup-plugin-terser'
import { paramCase } from 'param-case'
import { pascalCase } from 'pascal-case'
import { cwd, pkg, builderConfigs } from '../constants'
import path from 'path'

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
    ...builderConfigs.externals,
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
    css(),
    resolve(),
    commonjs(),
    externalGlobals(externals),
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
  const configs: RollupOptions[] = [
    {
      input: 'src/index.ts',
      output: {
        format: 'umd',
        file: path.resolve(cwd, `dist/${filename}.umd.development.js`),
        name: rootName,
        sourcemap: true,
        amd: {
          id: name,
        },
      },
      external: ['react', 'react-dom', 'react-is'],
      plugins: [
        ignoreImport({
          extensions: ['.scss', '.css', '.less'],
          body: 'export default undefined;',
        }),
        ...presets(),
        createEnvPlugin(),
      ],
    },
    {
      input: 'src/index.ts',
      output: {
        format: 'umd',
        file: path.resolve(cwd, `dist/${filename}.umd.production.js`),
        name: rootName,
        sourcemap: true,
        amd: {
          id: name,
        },
      },
      external: ['react', 'react-dom', 'react-is'],
      plugins: [
        postcss({
          extract: path.resolve(cwd, `dist/${moduleName}.css`),
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
        ...presets(),
        terser(),
        createEnvPlugin('production'),
      ],
    },
  ]
  if (builderConfigs.bundleDts) {
    configs.push(
      {
        input: 'esm/index.d.ts',
        output: {
          format: 'es',
          file: `dist/${filename}.d.ts`,
        },
        plugins: [dts()],
      },
      {
        input: 'esm/index.d.ts',
        output: {
          format: 'es',
          file: `dist/${filename}.all.d.ts`,
        },
        plugins: [
          dts({
            respectExternal: true,
          }),
        ],
      }
    )
  }
  await buildAll(configs)
}
