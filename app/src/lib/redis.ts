// lib/redis.ts
import net from 'net'

type Command = {
  raw: string
  resolve: (val: string | null) => void
  reject: (err: Error) => void
}

export class RedisClient {
  private socket: net.Socket
  private buffer = Buffer.alloc(0)
  private commandQueue: Command[] = []
  private isConnected = false
  private isProcessing = false

  constructor(host = '127.0.0.1', port = 6379) {
    this.socket = net.createConnection({ host, port })

    this.socket.on('connect', () => {
      this.isConnected = true
    })

    this.socket.on('data', (chunk) => {
      this.buffer = Buffer.concat([this.buffer, chunk])
      this.processQueue()
    })

    this.socket.on('error', (err) => {
      while (this.commandQueue.length) {
        const cmd = this.commandQueue.shift()
        if (cmd) cmd.reject(err)
      }
    })

    this.socket.on('close', () => {
      this.isConnected = false
    })
  }

  private readLine(): string | null {
    const idx = this.buffer.indexOf('\r\n')
    if (idx === -1) return null
    const line = this.buffer.slice(0, idx).toString()
    this.buffer = this.buffer.slice(idx + 2)
    return line
  }

  private processQueue() {
    if (!this.commandQueue.length || this.isProcessing) return

    const cmd = this.commandQueue[0]
    const line = this.readLine()
    if (!line) return

    this.commandQueue.shift()
    this.isProcessing = true

    if (line.startsWith('+')) {
      cmd.resolve(line.slice(1))
    } else if (line.startsWith('$')) {
      const len = parseInt(line.slice(1), 10)
      if (len === -1) {
        cmd.resolve(null)
      } else if (this.buffer.length >= len + 2) {
        const val = this.buffer.slice(0, len).toString()
        this.buffer = this.buffer.slice(len + 2)
        cmd.resolve(val)
      } else {
        // Not enough data yet, re-queue it
        this.commandQueue.unshift(cmd)
        this.isProcessing = false
        return
      }
    } else if (line.startsWith(':')) {
      // Handle integer responses
      const val = parseInt(line.slice(1), 10)
      cmd.resolve(val.toString())
    } else {
      cmd.reject(new Error('unexpected response: ' + line))
    }

    this.isProcessing = false
    // try next command
    setImmediate(() => this.processQueue())
  }

  private async send(raw: string): Promise<string | null> {
    if (!this.isConnected) {
      await new Promise((resolve) => this.socket.once('connect', resolve))
    }

    return new Promise<string | null>((resolve, reject) => {
      this.commandQueue.push({ raw, resolve, reject })
      this.socket.write(raw)
    })
  }

  async ping(): Promise<string | null> {
    const resp = await this.send('*1\r\n$4\r\nPING\r\n')
    return resp
  }

  async get(key: string): Promise<string | null> {
    const k = Buffer.byteLength(key)
    const cmd = `*2\r\n$3\r\nGET\r\n$${k}\r\n${key}\r\n`
    const resp = await this.send(cmd)
    return resp
  }

  async set(key: string, value: string): Promise<boolean> {
    const k = Buffer.byteLength(key)
    const v = Buffer.byteLength(value)
    const cmd = `*3\r\n$3\r\nSET\r\n$${k}\r\n${key}\r\n$${v}\r\n${value}\r\n`
    const resp = await this.send(cmd)
    return resp === 'OK'
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const cmd = `*3\r\n$6\r\nEXPIRE\r\n$${Buffer.byteLength(key)}\r\n${key}\r\n$${Buffer.byteLength(seconds.toString())}\r\n${seconds}\r\n`
    const resp = await this.send(cmd)
    return resp === '1'
  }

  quit() {
    this.socket.end()
  }
}



// // lib/redis.ts
// import net from 'net'

// export class RedisClient {
//   private socket: net.Socket
//   private buffer = Buffer.alloc(0)

//   constructor(host = '127.0.0.1', port = 6379) {
//     this.socket = net.createConnection({ host, port })
//     this.socket.on('data', (chunk) => {
//       this.buffer = Buffer.concat([this.buffer, chunk])
//     })
//   }

//   private readLine(): string {
//     const idx = this.buffer.indexOf('\r\n')
//     if (idx === -1) throw new Error('incomplete response')
//     const line = this.buffer.slice(0, idx).toString()
//     this.buffer = this.buffer.slice(idx + 2)
//     return line
//   }

//   private async send(cmd: string): Promise<string> {
//     this.socket.write(cmd)
//     // wait until CRLF arrives
//     while (this.buffer.indexOf('\r\n') === -1) {
//       await new Promise((r) => setTimeout(r, 5))
//     }
//     return this.readLine()
//   }

//   async ping(): Promise<string> {
//     const resp = await this.send('*1\r\n$4\r\nPING\r\n')
//     return resp.startsWith('+') ? resp.slice(1) : resp
//   }

//   async get(key: string): Promise<string | null> {
//     const k = Buffer.byteLength(key)
//     const resp = await this.send(`*2\r\n$3\r\nGET\r\n$${k}\r\n${key}\r\n`)
//     if (resp === '$-1') return null
//     if (!resp.startsWith('$')) throw new Error('unexpected: '+resp)
//     const length = parseInt(resp.slice(1), 10)
//     // wait for bulk payload + CRLF
//     while (this.buffer.length < length + 2) {
//       await new Promise((r) => setTimeout(r, 5))
//     }
//     const val = this.buffer.slice(0, length).toString()
//     this.buffer = this.buffer.slice(length + 2)
//     return val
//   }

//   async set(key: string, value: string): Promise<boolean> {
//     const k = Buffer.byteLength(key)
//     const v = Buffer.byteLength(value)
//     const resp = await this.send(
//       `*3\r\n$3\r\nSET\r\n$${k}\r\n${key}\r\n$${v}\r\n${value}\r\n`
//     )
//     return resp === '+OK'
//   }

//   quit() {
//     this.socket.end()
//   }
// }
