import { promises as fsp } from 'fs'

// Check if a file exists
export async function exists (path: string) {
  try {
    await fsp.access(path)
    return true
  } catch {
    return false
  }
}

export async function clearDir (path: string) {
  try {
    const files = await fsp.readdir(path)
    for (const file of files) {
      await fsp.unlink(`${path}/${file}`)
    }
  } catch {
    await fsp.mkdir(path, { recursive: true })
  }
}
