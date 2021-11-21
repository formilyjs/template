import glob from 'glob'
import path from 'path'
import fs from 'fs-extra'
import { cwd } from './constants'

export const copyStyleFiles = () => {
  return new Promise((resolve, reject) => {
    glob('src/**/*.{less,scss,sass,css}', { cwd }, async (err, files) => {
      if (err) return reject(err)
      files.forEach((filename) => {
        const filepath = path.resolve(cwd, filename)
        const distPathEs = filename.replace(/src\//, 'esm/')
        const distPathLib = filename.replace(/src\//, 'lib/')
        fs.copyFileSync(filepath, distPathEs)
        fs.copyFileSync(filepath, distPathLib)
      })
      resolve(0)
    })
  })
}
