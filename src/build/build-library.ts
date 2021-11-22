import fs from 'fs-extra'
import path from 'path'
import execa from 'execa'
import { cwd } from '../constants'

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
    params.push('--project', 'tsconfig.build.json', '--sourceRoot', 'lib')
  }
  execa('tsc', params).stdout.pipe(process.stdout)
}

const buildEsm = async () => {
  await buildDefault([
    '--module',
    'es2015',
    '--outDir',
    'esm',
    '--sourceRoot',
    'esm',
  ])
}

export const buildLibrary = async () => {
  await buildDefault()
  await buildEsm()
}
