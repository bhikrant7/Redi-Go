

# 🚀 Redi-Go — A Redis-like In-Memory Key-Value Store in Go

Redi-Go is a **Redis-inspired, in-memory key-value database** implemented in **Go (Golang)**. It replicates core Redis concepts such as a TCP server, the **RESP protocol**, **AOF (Append-Only File) persistence**, and **TTL-based key expiration**, while serving as an educational deep dive into systems programming, networking, and caching architectures. 

In addition, Redi-Go is used as a **caching layer** in a full-stack benchmark setup (Next.js + MongoDB) to demonstrate real-world performance improvements using in-memory caching. 

---

## ✨ Features

* ⚡ **In-memory key-value store** with fast lookups using Go maps 
* 🌐 **Custom TCP server** compatible with Redis clients via **RESP protocol** 
* 🧾 **AOF (Append-Only File) persistence** for durability and crash recovery 
* ⏱️ **TTL / EXPIRE support** for automatic key expiration 
* 🧵 **Concurrency-safe command handling** using mutexes 
* 📊 **Cache vs No-Cache benchmarking** with MongoDB backend 

---

## 🧠 Supported Commands

A subset of Redis commands is implemented, including:

* `PING`
* `SET`, `GET`, `DEL`, `EXISTS`
* `HSET`, `HGET`, `HGETALL`, `HDEL`
* `INCR`
* `EXPIRE`, `TTL`

Command handling is done via a dispatcher map that routes each command to its respective handler function. 

---

## 🏗️ Project Structure

```
.
├── main.go     # Entry point, TCP server, client handling, AOF loading
├── resp.go     # RESP protocol parsing and serialization
├── aof.go      # Append-Only File persistence (read/write & replay)
├── handler.go  # Command handlers (SET, GET, HSET, etc.)
└── store.go    # In-memory data store + TTL logic
```

Each file has a clear responsibility, keeping the system modular and easy to extend. 

---

## 🔌 How It Works (High Level)

1. The server listens on **TCP port 6379** (Redis default). 
2. Clients send commands encoded in **RESP** (e.g., `SET key value`). 
3. The server:

   * Parses RESP
   * Dispatches to the correct command handler
   * Executes the operation on the in-memory store
   * If it’s a write operation, appends it to the **AOF file**
4. On restart, the server **replays the AOF file** to rebuild memory state. 

---

## 💾 Persistence (AOF)

Redi-Go uses an **Append-Only File** strategy:

* Every mutating command (`SET`, `HSET`, etc.) is written to `database.aof`
* On startup, the server **replays all commands** from the AOF file to restore state
* Background syncing + mutexes ensure durability and thread safety 

This mirrors Redis’s AOF approach in a simplified form.

---

## ⚡ Caching Benchmark (Redis vs MongoDB)

Redi-Go is used as a **cache layer** in front of MongoDB for a movie API:

* ✅ **Cache Hit (Redis)**: ~1–3 ms response time
* ❌ **Cache Miss (MongoDB)**: ~200–300 ms response time
* Cached results are stored with a **5-minute TTL**
* Dramatically reduces DB load and improves latency 

This setup demonstrates how in-memory caching improves:

* Performance
* Scalability
* User experience 

---

## ▶️ Running the Server

### Prerequisites

* Go 1.20+ (or compatible)

### Steps

```bash
git clone https://github.com/your-username/redi-go.git
cd redi-go
go run main.go
```

The server will start listening on:

```
127.0.0.1:6379
```

You can test it using:

* `redis-cli`
* `netcat`
* Any Redis-compatible client

Example:

```bash
redis-cli -p 6379
SET name Bikrant
GET name
```

---

## 🎯 Educational Goals

This project is designed to help understand:

* How **Redis-like systems** work internally
* How **RESP protocol** is parsed and generated
* How to build a **concurrent TCP server** in Go
* How **AOF persistence** ensures durability
* How **caching layers** improve real-world backend performance 

---

## 📌 Use Cases

* Learning systems programming in Go
* Understanding in-memory databases
* Prototyping a lightweight cache server
* Demonstrating cache vs database performance
* Backend performance optimization experiments 

---

## 👨‍💻 Authors

* Bhikrant Borah
* Shaswata Gogoi
* Syed Tasdeeque Ruhani

Under the guidance of **Mr. Diganta Baishya**, Associate Professor, CSE. 

---

## 📜 License

This project is for **educational and academic use**. You may adapt or extend it for learning and experimentation.

---
