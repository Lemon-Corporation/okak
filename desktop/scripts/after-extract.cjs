const fs = require('node:fs/promises')
const path = require('node:path')

module.exports = async function afterExtract(context) {
  const appOutDir = context?.appOutDir

  if (!appOutDir) {
    return
  }

  const appBundleDir = appOutDir.endsWith('.app')
    ? appOutDir
    : path.join(appOutDir, 'Electron.app')

  const targetBinary = path.join(appBundleDir, 'Contents', 'MacOS', 'Electron')

  try {
    await fs.access(targetBinary)
    return
  } catch {}

  const electronPackagePath = require.resolve('electron/package.json', {
    paths: [context?.packager?.projectDir || process.cwd()],
  })
  const sourceBinary = path.join(
    path.dirname(electronPackagePath),
    'dist',
    'Electron.app',
    'Contents',
    'MacOS',
    'Electron'
  )

  try {
    await fs.access(sourceBinary)
  } catch {
    return
  }

  await fs.mkdir(path.dirname(targetBinary), { recursive: true })
  await fs.copyFile(sourceBinary, targetBinary)
  await fs.chmod(targetBinary, 0o755)
}
