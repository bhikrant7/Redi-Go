package main

import "sync"


var Handlers = map[string]func([]Value) Value{
	"PING":    ping,
	"SET":     set,
	"GET":     get,
	"HSET":    hset,
	"HGET":    hget,
	"HGETALL": hgetall,
}


//ping responding with pong or with the attached value,type And The bulk string
func ping(args []Value) Value {
	if len(args) == 0 {
		return Value{typ: "string", str: "PONG"}
	}

	return Value{typ: "string", str: args[0].bulk}
}


//set and get commands(HASH maPs)
var SETs = map[string]string{}
var SETsMu = sync.RWMutex{} //Concurrency locks

func set(args []Value) Value {
	if len(args) != 2 {
		return Value{typ: "error", str: "ERR wrong number of arguments for 'set' command"}
	}

	key := args[0].bulk
	value := args[1].bulk

	SETsMu.Lock()
	SETs[key] = value
	SETsMu.Unlock()

	return Value{typ: "string", str: "OK"}
}

func get(args []Value) Value {
	if len(args) != 1 {
		return Value{typ: "error", str: "ERR wrong number of arguments for 'get' command"}
	}

	key := args[0].bulk

	SETsMu.RLock()
	value, ok := SETs[key]
	SETsMu.RUnlock()

	if !ok {
		return Value{typ: "null"}
	}

	return Value{typ: "bulk", bulk: value}
}

// Hsets and Hgets (for hashmaps within hashmap) 

var HSETs = map[string]map[string]string{}
var HSETsMu = sync.RWMutex{}

func hset(args []Value) Value {
	if len(args) != 3 {
		return Value{typ: "error", str: "ERR wrong number of arguments for 'hset' command"}
	}

	hash := args[0].bulk
	key := args[1].bulk
	value := args[2].bulk

	HSETsMu.Lock()
	if _, ok := HSETs[hash]; !ok {
		HSETs[hash] = map[string]string{}
	}
	HSETs[hash][key] = value
	HSETsMu.Unlock()

	return Value{typ: "string", str: "OK"}
}

func hget(args []Value) Value {
	if len(args) != 2 {
		return Value{typ: "error", str: "ERR wrong number of arguments for 'hget' command"}
	}

	hash := args[0].bulk
	key := args[1].bulk

	HSETsMu.RLock()
	value, ok := HSETs[hash][key]
	HSETsMu.RUnlock()

	if !ok {
		return Value{typ: "null"}
	}

	return Value{typ: "bulk", bulk: value}
}

func hgetall(args []Value) Value {
	if len(args) != 1 {
		return Value{typ: "error", str: "ERR wrong number of arguments for 'hgetall' command"}
	}

	hash := args[0].bulk

	HSETsMu.RLock()
	defer HSETsMu.RUnlock()

	
	hmap, ok := HSETs[hash]
	if !ok {
		return Value{typ: "array", array: []Value{}}
	}

	
	var result []Value
	for field, val := range hmap {
		result = append(result, Value{typ: "bulk", bulk: field})
		result = append(result, Value{typ: "bulk", bulk: val})
	}

	return Value{typ: "array", array: result}
}

// package main

// import (
// 	"strconv"
// 	"sync"
// 	"time"
// )

// var Handlers = map[string]func([]Value) Value{
// 	"PING":    ping,
// 	"SET":     set,
// 	"GET":     get,
// 	"DEL":     del,
// 	"EXISTS":  exists,
// 	"INCR":    incr,
// 	"EXPIRE":  expire,
// 	"TTL":     ttl,
// 	"HSET":    hset,
// 	"HGET":    hget,
// 	"HGETALL": hgetall,
// }

// var Hashes = map[string]map[string]string{}
// var HashesMu = sync.RWMutex{}

// // PING
// func ping(args []Value) Value {
// 	if len(args) == 0 {
// 		return Value{typ: "string", str: "PONG"}
// 	}
// 	return Value{typ: "string", str: args[0].bulk}
// }

// // SET / GET
// var SETs = map[string]string{}
// var SETsMu = sync.RWMutex{}

// var Expirations = map[string]time.Time{}
// var ExpMu = sync.RWMutex{}

// func set(args []Value) Value {
// 	if len(args) != 2 {
// 		return Value{typ: "error", str: "ERR wrong number of arguments for 'set' command"}
// 	}

// 	key := args[0].bulk
// 	value := args[1].bulk

// 	SETsMu.Lock()
// 	SETs[key] = value
// 	SETsMu.Unlock()

// 	// Remove expiry if re-setting
// 	ExpMu.Lock()
// 	delete(Expirations, key)
// 	ExpMu.Unlock()

// 	return Value{typ: "string", str: "OK"}
// }

// func get(args []Value) Value {
// 	if len(args) != 1 {
// 		return Value{typ: "error", str: "ERR wrong number of arguments for 'get' command"}
// 	}

// 	key := args[0].bulk

// 	// Check for expiry
// 	ExpMu.RLock()
// 	exp, hasExp := Expirations[key]
// 	ExpMu.RUnlock()

// 	if hasExp && time.Now().After(exp) {
// 		SETsMu.Lock()
// 		delete(SETs, key)
// 		SETsMu.Unlock()

// 		ExpMu.Lock()
// 		delete(Expirations, key)
// 		ExpMu.Unlock()

// 		return Value{typ: "null"}
// 	}

// 	SETsMu.RLock()
// 	value, ok := SETs[key]
// 	SETsMu.RUnlock()

// 	if !ok {
// 		return Value{typ: "null"}
// 	}

// 	return Value{typ: "bulk", bulk: value}
// }

// // DEL
// func del(args []Value) Value {
// 	if len(args) < 1 {
// 		return Value{typ: "error", str: "ERR wrong number of arguments for 'del' command"}
// 	}

// 	deleted := 0

// 	SETsMu.Lock()
// 	HashesMu.Lock()
// 	ExpMu.Lock()

// 	for _, arg := range args {
// 		key := arg.bulk

// 		// Delete from SETs
// 		if _, exists := SETs[key]; exists {
// 			delete(SETs, key)
// 			deleted++
// 		}

// 		// Delete from Hashes
// 		if _, exists := Hashes[key]; exists {
// 			delete(Hashes, key)
// 			deleted++
// 		}

// 		// Delete expiration
// 		delete(Expirations, key)
// 	}

// 	ExpMu.Unlock()
// 	HashesMu.Unlock()
// 	SETsMu.Unlock()

// 	return Value{typ: "integer", integer: deleted}
// }


// // EXISTS
// func exists(args []Value) Value {
// 	if len(args) < 1 {
// 		return Value{typ: "error", str: "ERR wrong number of arguments for 'exists' command"}
// 	}

// 	count := 0
// 	now := time.Now()

// 	SETsMu.RLock()
// 	ExpMu.RLock()
// 	for _, arg := range args {
// 		exp, hasExp := Expirations[arg.bulk]
// 		if (!hasExp || now.Before(exp)) && SETs[arg.bulk] != "" {
// 			count++
// 		}
// 	}
// 	ExpMu.RUnlock()
// 	SETsMu.RUnlock()

// 	return Value{typ: "integer", integer: count}
// }

// // INCR
// func incr(args []Value) Value {
// 	if len(args) != 1 {
// 		return Value{typ: "error", str: "ERR wrong number of arguments for 'incr' command"}
// 	}

// 	key := args[0].bulk

// 	SETsMu.Lock()
// 	defer SETsMu.Unlock()

// 	valStr, ok := SETs[key]
// 	if !ok {
// 		SETs[key] = "1"
// 		return Value{typ: "integer", integer: 1}
// 	}

// 	val, err := strconv.Atoi(valStr)
// 	if err != nil {
// 		return Value{typ: "error", str: "ERR value is not an integer or out of range"}
// 	}

// 	val++
// 	SETs[key] = strconv.Itoa(val)

// 	return Value{typ: "integer", integer: val}
// }

// // EXPIRE
// func expire(args []Value) Value {
// 	if len(args) != 2 {
// 		return Value{typ: "error", str: "ERR wrong number of arguments for 'expire' command"}
// 	}

// 	key := args[0].bulk
// 	seconds, err := strconv.Atoi(args[1].bulk)
// 	if err != nil || seconds < 0 {
// 		return Value{typ: "error", str: "ERR invalid expire time"}
// 	}

// 	SETsMu.RLock()
// 	_, exists := SETs[key]
// 	SETsMu.RUnlock()
// 	if !exists {
// 		return Value{typ: "integer", integer: 0}
// 	}

// 	ExpMu.Lock()
// 	Expirations[key] = time.Now().Add(time.Duration(seconds) * time.Second)
// 	ExpMu.Unlock()

// 	return Value{typ: "integer", integer: 1}
// }

// // TTL
// func ttl(args []Value) Value {
// 	if len(args) != 1 {
// 		return Value{typ: "error", str: "ERR wrong number of arguments for 'ttl' command"}
// 	}

// 	key := args[0].bulk

// 	ExpMu.RLock()
// 	exp, exists := Expirations[key]
// 	ExpMu.RUnlock()

// 	if !exists {
// 		return Value{typ: "integer", integer: -1}
// 	}

// 	remaining := int(time.Until(exp).Seconds())
// 	if remaining < 0 {
// 		return Value{typ: "integer", integer: -2}
// 	}

// 	return Value{typ: "integer", integer: remaining}
// }

// // HSET, HGET, HGETALL
// var HSETs = map[string]map[string]string{}
// var HSETsMu = sync.RWMutex{}

// func hset(args []Value) Value {
// 	if len(args) != 3 {
// 		return Value{typ: "error", str: "ERR wrong number of arguments for 'hset' command"}
// 	}

// 	hash := args[0].bulk
// 	key := args[1].bulk
// 	value := args[2].bulk

// 	HSETsMu.Lock()
// 	if _, ok := HSETs[hash]; !ok {
// 		HSETs[hash] = map[string]string{}
// 	}
// 	HSETs[hash][key] = value
// 	HSETsMu.Unlock()

// 	return Value{typ: "string", str: "OK"}
// }

// func hget(args []Value) Value {
// 	if len(args) != 2 {
// 		return Value{typ: "error", str: "ERR wrong number of arguments for 'hget' command"}
// 	}

// 	hash := args[0].bulk
// 	key := args[1].bulk

// 	HSETsMu.RLock()
// 	value, ok := HSETs[hash][key]
// 	HSETsMu.RUnlock()

// 	if !ok {
// 		return Value{typ: "null"}
// 	}

// 	return Value{typ: "bulk", bulk: value}
// }

// func hgetall(args []Value) Value {
// 	if len(args) != 1 {
// 		return Value{typ: "error", str: "ERR wrong number of arguments for 'hgetall' command"}
// 	}

// 	hash := args[0].bulk

// 	HSETsMu.RLock()
// 	defer HSETsMu.RUnlock()

	
// 	hmap, ok := HSETs[hash]
// 	if !ok {
// 		return Value{typ: "array", array: []Value{}}
// 	}

	
// 	var result []Value
// 	for field, val := range hmap {
// 		result = append(result, Value{typ: "bulk", bulk: field})
// 		result = append(result, Value{typ: "bulk", bulk: val})
// 	}

// 	return Value{typ: "array", array: result}
// }


// // func hget(args []Value) Value {
// // 	if len(args) != 2 {
// // 		return Value{typ: "error", str: "ERR wrong number of arguments for 'hget' command"}
// // 	}

// // 	hash := args[0].bulk
// // 	key := args[1].bulk

// // 	HSETsMu.RLock()
// // 	value, ok := HSETs[hash][key]
// // 	HSETsMu.RUnlock()

// // 	if !ok {
// // 		return Value{typ: "null"}
// // 	}

// // 	return Value{typ: "bulk", bulk: value}
// // }

// // func hgetall(args []Value) Value {
// // 	if len(args) != 1 {
// // 		return Value{typ: "error", str: "ERR wrong number of arguments for 'hgetall' command"}
// // 	}

// // 	hash := args[0].bulk

// // 	HSETsMu.RLock()
// // 	defer HSETsMu.RUnlock()

// // 	hmap, ok := HSETs[hash]
// // 	if !ok {
// // 		return Value{typ: "array", array: []Value{}}
// // 	}

// // 	var result []Value
// // 	for field, val := range hmap {
// // 		result = append(result, Value{typ: "bulk", bulk: field})
// // 		result = append(result, Value{typ: "bulk", bulk: val})
// // 	}

// // 	return Value{typ: "array", array: result}
// // }
