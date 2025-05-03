package main

import (
	"fmt"
	"net"
	"strings"
)

func main() {
	fmt.Println("Listening on port :6379")

	// Create a new server listener
	l, err := net.Listen("tcp", ":6379")
	if err != nil {
		fmt.Println("Error starting server:", err)
		return
	}
	defer l.Close()

	// Open AOF file
	aof, err := NewAof("database.aof")
	if err != nil {
		fmt.Println("Error opening AOF file:", err)
		return
	}
	defer aof.Close()

	// Read AOF data at startup (if any)
	aof.Read(func(value Value) {
		command := strings.ToUpper(value.array[0].bulk)
		args := value.array[1:]

		handler, ok := Handlers[command]
		if !ok {
			fmt.Println("Invalid command:", command)
			return
		}

		// Apply handler to replay command
		handler(args)
	})

	// Start accepting incoming connections
	for {
		conn, err := l.Accept()
		if err != nil {
			fmt.Println("Error accepting connection:", err)
			continue // Proceed with accepting the next connection
		}

		// Handle each connection concurrently using goroutines
		go handleConnection(conn, aof)
	}
}

// handleConnection processes individual connections
func handleConnection(conn net.Conn, aof *Aof) {
    defer conn.Close()

    // Create a RESP writer for writing responses to the client
    writer := NewWriter(conn)

    // Loop to continuously read commands from the connection
    for {
        // Read the RESP request from the client
        resp := NewResp(conn)
        value, err := resp.Read()
        if err != nil {
            // Handle EOF or other read errors
            if err.Error() == "EOF" {
                fmt.Println("Client closed the connection.")
                return // Gracefully close the connection on EOF
            }
            fmt.Println("Error reading request:", err)
            return // Exit on other errors
        }

        // Validate the RESP array format
        if value.typ != "array" {
            fmt.Println("Invalid request: expected array")
            writer.Write(Value{typ: "string", str: "Invalid request"})
            continue
        }

        // Ensure the command array has at least one element (the command)
        if len(value.array) == 0 {
            fmt.Println("Invalid request: expected array length > 0")
            writer.Write(Value{typ: "string", str: "Invalid request"})
            continue
        }

        // Extract the command and arguments
        command := strings.ToUpper(value.array[0].bulk)
        args := value.array[1:]

        // Find the appropriate handler for the command
        handler, ok := Handlers[command]
        if !ok {
            fmt.Println("Invalid command:", command)
            writer.Write(Value{typ: "string", str: "Invalid command"})
            continue
        }

        // If it's a mutating command (SET, HSET, etc.), write to the AOF log
        if command == "SET" || command == "HSET" {
            aof.Write(value)
        }

        // Call the handler function to process the command
        result := handler(args)

        // Send the result back to the client
        writer.Write(result)
    }
}




// package main

// import (
// 	"fmt"
// 	"net"
// 	"strings"
// )

// func main() {
// 	fmt.Println("Listening on port :6379")

// 	// Create a new server
// 	l, err := net.Listen("tcp", ":6379")
// 	if err != nil {
// 		fmt.Println(err)
// 		return
// 	}

// 	aof, err := NewAof("database.aof")
// 	if err != nil {
// 		fmt.Println(err)
// 		return
// 	}
// 	defer aof.Close()

// 	aof.Read(func(value Value) {
// 		command := strings.ToUpper(value.array[0].bulk)
// 		args := value.array[1:]

// 		handler, ok := Handlers[command]
// 		if !ok {
// 			fmt.Println("Invalid command: ", command)
// 			return
// 		}

// 		handler(args)
// 	})

// 	// Listen for connections
// 	conn, err := l.Accept()
// 	if err != nil {
// 		fmt.Println(err)
// 		return
// 	}

// 	defer conn.Close()

// 	for {
// 		resp := NewResp(conn)
// 		value, err := resp.Read()
// 		if err != nil {
// 			fmt.Println(err)
// 			return
// 		}

// 		if value.typ != "array" {
// 			fmt.Println("Invalid request, expected array")
// 			continue
// 		}

// 		if len(value.array) == 0 {
// 			fmt.Println("Invalid request, expected array length > 0")
// 			continue
// 		}

// 		command := strings.ToUpper(value.array[0].bulk)
// 		args := value.array[1:]

// 		writer := NewWriter(conn)

// 		handler, ok := Handlers[command]
// 		if !ok {
// 			fmt.Println("Invalid command: ", command)
// 			writer.Write(Value{typ: "string", str: ""})
// 			continue
// 		}

// 		if command == "SET" || command == "HSET" {
// 			aof.Write(value)
// 		}

// 		result := handler(args)
// 		writer.Write(result)
// 	}
// }