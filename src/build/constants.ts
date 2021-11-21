import path from 'path'
import fs from 'fs-extra'

export const cwd = process.cwd()

export const entry = path.resolve(cwd, 'src/index.ts')

let pkg: any = {}

try {
  pkg = fs.readJSONSync(path.resolve(cwd, 'package.json'))
} catch {
  pkg = {}
}

export { pkg }
