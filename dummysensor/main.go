package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"strconv"
	"time"
)

type SensorData struct {
	ID        int    `json:"id"`
	Result    string `json:"result"`
	Timestamp string `json:"timestamp"`
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Please provide number of JSON records as argument")
		return
	}

	numJSON, err := strconv.Atoi(os.Args[1])
	if err != nil {
		fmt.Println("Invalid number:", err)
		return
	}

	id := 0

	for i := 0; i < numJSON; i++ {
		id++

		data := SensorData{
			ID:        id,
			Result:    fmt.Sprintf("%08x", rand.Int31()),
			Timestamp: time.Now().Local().Format("2006-01-02 15:04:05.999"),
		}

		jsonData, err := json.Marshal(data)
		if err != nil {
			fmt.Println("Error marshalling JSON:", err)
			continue
		}
		fmt.Println(string(jsonData))
	}
}
