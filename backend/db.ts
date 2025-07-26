// DB INTERACTION

import { IncomingMessage } from "node:http"

// odczyt body 
export function getBodyData (req:IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      let body:string = ''

      req.on('data', (chunk:any) => {
        body += chunk.toString()
      })

      req.on('end', () => {
        resolve(body)
      })
    } catch (error) {
      reject(error)
    }
  })
}