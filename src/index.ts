import program from 'commander'
import { build } from './build'

program
  .option('-i, --init', 'init project by template')
  .option('-b, --build', 'build project')

const options = program.parse(process.argv)

if (options.build) {
  build()
} else if (options.init) {
}
