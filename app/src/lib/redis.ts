// lib/redis.ts
import net from 'net'

export class RedisClient {
  private socket: net.Socket
  private buffer = Buffer.alloc(0)

  constructor(host = '127.0.0.1', port = 6379) {
    this.socket = net.createConnection({ host, port })
    this.socket.on('data', (chunk) => {
      this.buffer = Buffer.concat([this.buffer, chunk])
    })
  }

  private readLine(): string {
    const idx = this.buffer.indexOf('\r\n')
    if (idx === -1) throw new Error('incomplete response')
    const line = this.buffer.slice(0, idx).toString()
    this.buffer = this.buffer.slice(idx + 2)
    return line
  }

  private async send(cmd: string): Promise<string> {
    this.socket.write(cmd)
    // wait until CRLF arrives
    while (this.buffer.indexOf('\r\n') === -1) {
      await new Promise((r) => setTimeout(r, 5))
    }
    return this.readLine()
  }

  async ping(): Promise<string> {
    const resp = await this.send('*1\r\n$4\r\nPING\r\n')
    return resp.startsWith('+') ? resp.slice(1) : resp
  }

  async get(key: string): Promise<string | null> {
    const k = Buffer.byteLength(key)
    const resp = await this.send(`*2\r\n$3\r\nGET\r\n$${k}\r\n${key}\r\n`)
    if (resp === '$-1') return null
    if (!resp.startsWith('$')) throw new Error('unexpected: '+resp)
    const length = parseInt(resp.slice(1), 10)
    // wait for bulk payload + CRLF
    while (this.buffer.length < length + 2) {
      await new Promise((r) => setTimeout(r, 5))
    }
    const val = this.buffer.slice(0, length).toString()
    this.buffer = this.buffer.slice(length + 2)
    return val
  }

  async set(key: string, value: string): Promise<boolean> {
    const k = Buffer.byteLength(key)
    const v = Buffer.byteLength(value)
    const resp = await this.send(
      `*3\r\n$3\r\nSET\r\n$${k}\r\n${key}\r\n$${v}\r\n${value}\r\n`
    )
    return resp === '+OK'
  }

  quit() {
    this.socket.end()
  }
}
