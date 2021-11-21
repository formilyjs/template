import glob from 'glob'
import path from 'path'
import fs from 'fs-extra'
import { cwd } from './constants'

const createStyleFile = (files: string[]) => {
  return `// auto generated code
  ${files
    .map((path) => {
      return `import '${path}'\n`
    })
    .join('')}`
}

export const buildRootStyle = () => {
  return new Promise((resolve, reject) => {
    glob('src/*/style.{less,scss,sass}', { cwd }, async (err, files) => {
      if (err) return reject(err)
      await fs.writeFile(
        path.resolve(cwd, './src/style.ts'),
        createStyleFile(files),
        'utf8'
      )
      resolve(0)
    })
  })
}
