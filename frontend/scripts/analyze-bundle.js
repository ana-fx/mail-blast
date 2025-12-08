#!/usr/bin/env node

/**
 * Bundle size analysis script
 * Run: node scripts/analyze-bundle.js
 */

const fs = require('fs')
const path = require('path')

const BUILD_DIR = path.join(__dirname, '../.next')
const BUNDLE_SIZE_LIMIT = 200 * 1024 // 200KB

function analyzeBundle() {
  console.log('📦 Analyzing bundle sizes...\n')

  const chunksDir = path.join(BUILD_DIR, 'static/chunks')
  
  if (!fs.existsSync(chunksDir)) {
    console.error('❌ Build directory not found. Run `npm run build` first.')
    process.exit(1)
  }

  const files = fs.readdirSync(chunksDir)
  const jsFiles = files.filter(f => f.endsWith('.js'))

  let totalSize = 0
  const largeFiles = []

  jsFiles.forEach(file => {
    const filePath = path.join(chunksDir, file)
    const stats = fs.statSync(filePath)
    const size = stats.size
    const sizeKB = (size / 1024).toFixed(2)

    totalSize += size

    if (size > BUNDLE_SIZE_LIMIT) {
      largeFiles.push({ file, size: sizeKB })
    }
  })

  const totalSizeKB = (totalSize / 1024).toFixed(2)
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2)

  console.log(`Total bundle size: ${totalSizeKB} KB (${totalSizeMB} MB)`)
  console.log(`Number of chunks: ${jsFiles.length}\n`)

  if (largeFiles.length > 0) {
    console.log('⚠️  Large chunks detected:')
    largeFiles.forEach(({ file, size }) => {
      console.log(`  - ${file}: ${size} KB`)
    })
    console.log()
  }

  if (totalSize > BUNDLE_SIZE_LIMIT * 5) {
    console.error('❌ Total bundle size exceeds recommended limit!')
    process.exit(1)
  }

  console.log('✅ Bundle size analysis complete')
}

analyzeBundle()

