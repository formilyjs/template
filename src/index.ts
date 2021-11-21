import { build } from './build'

if (process.argv.includes('build')) {
  build()
} else if (process.argv.includes('init')) {
}
