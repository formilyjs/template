import path from 'path'
import fs from 'fs-extra'
import ejs from 'ejs'
import { glob } from 'glob'
import { cwd } from '../constants'

export interface IGeneratorParams {
  template: string
  repoName: string
  userName: string
  brandName: string
  pascalName: string
}

export const generate = (params: IGeneratorParams) => {
  return new Promise((resolve, reject) => {
    const base = path.resolve(__dirname, `../../templates/${params.template}`)
    glob(
      '**/*',
      {
        dot: true,
        cwd: base,
      },
      (err, files) => {
        if (err) return reject(err)

        files.forEach((filename) => {
          const filepath = path.resolve(base, filename)
          const dist = path.resolve(cwd, filename)
          const distPath = dist.replace(/ignore\.tpl$/, 'ignore')
          const stat = fs.statSync(filepath)
          if (stat.isDirectory()) {
            if (filepath.includes('.tpl')) return
            fs.copySync(filepath, dist)
            return
          }
          const contents = fs.readFileSync(filepath, 'utf-8')
          const template = ejs.compile(contents)
          fs.outputFileSync(distPath, template(params))
        })
        console.log('🎉🎉 generate success!')
        resolve(0)
      }
    )
  })
}
