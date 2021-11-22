#!/usr/bin/env ts-node
import { build, init } from './index'
if (process.argv.includes('build')) {
  build()
} else if (process.argv.includes('init')) {
  init()
}
