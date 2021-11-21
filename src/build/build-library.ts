import fs from 'fs-extra'
import path from 'path'
import execa from 'execa'
import { cwd } from './constants'

const hasBuildConfig = async () => {
  try {
    await fs.access(path.resolve(cwd, 'tsconfig.build.json'))
    return true
  } catch {
    return false
  }
}

const buildDefault = async (params: string[] = []) => {
  const hasProjects = await hasBuildConfig()
  if (hasProjects) {
    params.push('--project', 'tsconfig.build.json')
  }
  const results = execa.sync('tsc', params)
  process.stdout.write(results.stdout)
  process.stderr.write(results.stderr)
}

const buildEsm = async () => {
  await buildDefault(['--module', 'es2015', '--outDir', 'esm'])
}

export const buildLibrary = async () => {
  await buildDefault()
  await buildEsm()
}
