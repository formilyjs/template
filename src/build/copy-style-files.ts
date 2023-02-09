import glob from 'glob'
import path from 'path'
import fs from 'fs-extra'
import { cwd } from '../constants'

export const copyStyleFiles = () => {
  return new Promise((resolve, reject) => {
    glob('src/**/*.{less,scss,sass,css}', { cwd }, async (err, files) => {
      if (err) return reject(err)
      files.forEach((filename) => {
        const filepath = path.resolve(cwd, filename)
        const distNameEs = filepath
          .replace(/src\//, 'esm/')
          .replace(/src\\/, 'esm\\')
        const distNameLib = filepath
          .replace(/src\//, 'lib/')
          .replace(/src\\/, 'lib\\')
        const distPathEs = path.resolve(cwd, distNameEs)
        const distPathLib = path.resolve(cwd, distNameLib)
        fs.copySync(filepath, distPathEs)
        fs.copySync(filepath, distPathLib)
      })
      resolve(0)
    })
  })
}
