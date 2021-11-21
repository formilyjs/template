#!/usr/bin/env node
import { build } from './index'

if (process.argv.includes('build')) {
  build()
} else if (process.argv.includes('init')) {
}
