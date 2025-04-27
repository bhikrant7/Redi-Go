package main

import (
	// "fmt"
	"strconv"
	"sync"
	"time"
)


var Handlers = map[string]func([]Value) Value{
	"PING":    ping,
	"SET":     set,
	"GET":     get,
	"HSET":    hset,
	"HGET":    hget,
	"HGETALL": hgetall,
	"EXISTS":  exists,
	"TTL":     ttl,
	"EXPIRE":  expire,
	"INCR":    incr,
	"DEL":     del,
	"HDEL":    hdel,
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

    //expiry dekhne ke liye
    TTLsMu.RLock()
    expireAt, ok := TTLs[key]
    TTLsMu.RUnlock()
    if ok && time.Now().After(expireAt) {
        del([]Value{{bulk: key}})  // Auto delete expired key
        return Value{typ: "null"}
    }

    // normal way
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

//Value of the key in the hash map
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

//Sab key value pairs milne wala hai
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

	//bhai sab key-value pairs ko array mein daal deneka
	var result []Value
	for field, val := range hmap {
		result = append(result, Value{typ: "bulk", bulk: field})
		result = append(result, Value{typ: "bulk", bulk: val})
	}
	// fmt.Println("hgetall returning", result) // Debugging line

	
	return Value{typ: "array", array: result}
}


//Exists command to check if a key exists
func exists(args []Value) Value {
    if len(args) != 1 {
        return Value{typ: "error", str: "ERR wrong number of arguments for 'exists' command"}
    }

    key := args[0].bulk

    SETsMu.RLock()
    defer SETsMu.RUnlock()

    _, ok := SETs[key]
    if ok {
        return Value{typ: "integer", integer: 1}
    }

    HSETsMu.RLock()
    defer HSETsMu.RUnlock()

	_, ok = HSETs[key]
	if ok {
		return Value{typ: "integer", integer: 1}
	}

    return Value{typ: "integer", integer: 0}
}


var TTLs = map[string]time.Time{}
var TTLsMu = sync.RWMutex{}

//TTL 
func ttl(args []Value) Value {
    if len(args) != 1 {
        return Value{typ: "error", str: "ERR wrong number of arguments for 'ttl' command"}
    }

    key := args[0].bulk

    TTLsMu.RLock()
    defer TTLsMu.RUnlock()

    expireAt, ok := TTLs[key]
    if !ok {
        return Value{typ: "integer", integer: -1} // -1 means no expire
    }

	remaining := int(time.Until(expireAt).Seconds())
    if remaining < 0 {
        return Value{typ: "integer", integer: -2} // -2 means expired
    }

    return Value{typ: "integer", integer: remaining}
}

//expiry
func expire(args []Value) Value {
    if len(args) != 2 {
        return Value{typ: "error", str: "ERR wrong number of arguments for 'expire' command"}
    }

    key := args[0].bulk
    seconds, err := strconv.Atoi(args[1].bulk)
    if err != nil {
        return Value{typ: "error", str: "ERR value is not an integer or out of range"}
    }

    TTLsMu.Lock()
    defer TTLsMu.Unlock()

    TTLs[key] = time.Now().Add(time.Duration(seconds) * time.Second)

    return Value{typ: "integer", integer: 1}
}

//Increment
func incr(args []Value) Value {
    if len(args) != 1 {
        return Value{typ: "error", str: "ERR wrong number of arguments for 'incr' command"}
    }

    key := args[0].bulk

    SETsMu.Lock()
    defer SETsMu.Unlock()

    val, ok := SETs[key]
    if !ok {
        SETs[key] = "1"
        return Value{typ: "integer", integer: 1}
    }

    intVal, err := strconv.Atoi(val)
    if err != nil {
        return Value{typ: "error", str: "ERR value is not an integer"}
    }

    intVal++
    SETs[key] = strconv.Itoa(intVal)

    return Value{typ: "integer", integer: intVal}
}

//del karneka
func del(args []Value) Value {
    if len(args) < 1 {
        return Value{typ: "error", str: "ERR wrong number of arguments for 'del' command"}
    }

    deleted := 0

    SETsMu.Lock()
    defer SETsMu.Unlock()

    HSETsMu.Lock()
    defer HSETsMu.Unlock()

    for _, arg := range args {
        key := arg.bulk

        if _, ok := SETs[key]; ok {
            delete(SETs, key)
            deleted++
        }

        if _, ok := HSETs[key]; ok {
            delete(HSETs, key)
            deleted++
        }

        delete(TTLs, key)
    }

    return Value{typ: "integer", integer: deleted}
}

//hdel
func hdel(args []Value) Value {
    if len(args) < 2 {
        return Value{typ: "error", str: "ERR wrong number of arguments for 'hdel' command"}
    }

    key := args[0].bulk

    HSETsMu.Lock()
    defer HSETsMu.Unlock()

    hmap, ok := HSETs[key]
    if !ok {
        return Value{typ: "integer", integer: 0}
    }

    deleted := 0
    for _, field := range args[1:] {
        if _, ok := hmap[field.bulk]; ok {
            delete(hmap, field.bulk)
            deleted++
        }
    }

    return Value{typ: "integer", integer: deleted}
}
