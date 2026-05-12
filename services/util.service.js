import fs from "fs"

export const utilService = {
  readJsonFile,
  writeJsonFile,
  makeId,
}

export function readJsonFile(path) {
  const str = fs.readFileSync(path, "utf8")
  const json = JSON.parse(str)
  return json
}

export function writeJsonFile(path, data) {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(data, null, 2)

    fs.writeFile(path, jsonData, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

export function makeId(length = 5) {
  let text = ""
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
