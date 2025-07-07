import * as fs from 'node:fs'
import * as path from 'node:path'

export function preOrderDirectoryTraverse(dir, dirCallback, fileCallback) {
  for (const filename of fs.readdirSync(dir)) {
    if (filename === '.git') {
      continue
    }
    const fullpath = path.resolve(dir, filename)
    if (fs.lstatSync(fullpath).isDirectory()) {
      dirCallback(fullpath)
      // in case the dirCallback removes the directory entirely
      if (fs.existsSync(fullpath)) {
        preOrderDirectoryTraverse(fullpath, dirCallback, fileCallback)
      }
      continue
    }
    fileCallback(fullpath)
  }
}

export const dotGitDirectoryState = {
  hasDotGitDirectory: false,
}

export function postOrderDirectoryTraverse(dir, dirCallback, fileCallback) {
  for (const filename of fs.readdirSync(dir)) {
    if (filename === '.git') {
      dotGitDirectoryState.hasDotGitDirectory = true
      continue
    }
    const fullpath = path.resolve(dir, filename)
    if (fs.lstatSync(fullpath).isDirectory()) {
      postOrderDirectoryTraverse(fullpath, dirCallback, fileCallback)
      dirCallback(fullpath)
      continue
    }
    fileCallback(fullpath)
  }
}
