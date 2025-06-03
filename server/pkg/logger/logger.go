package logger

import (
	"bytes"
	"fmt"
	"io"
	"sync"
	"time"

)

type Logger struct {
	ch         chan string
	bufferSize int
	buffer     *bytes.Buffer
	writer     io.Writer
	cancel     chan struct{}
	wg         *sync.WaitGroup
	isOpen     bool
}

const (
	DEFAULT_BUFFER_SIZE int = 1024
)

type LoggerOpts struct {
	ChanBuffer uint
	BufferSize int
}

func New(writer io.Writer, opts ...*LoggerOpts) *Logger {
	var (
		bufferSize = DEFAULT_BUFFER_SIZE
		ch         chan string
	)

	if len(opts) > 0 && opts[0] != nil {
		if opts[0].BufferSize > 0 {
			bufferSize = opts[0].BufferSize
		}
		if opts[0].ChanBuffer > 0 {
			ch = make(chan string, opts[0].ChanBuffer)
		}
	}

	if ch == nil {
		ch = make(chan string)
	}

	log := &Logger{
		ch:         ch,
		bufferSize: bufferSize,
		buffer:     bytes.NewBuffer(make([]byte, 0, bufferSize)),
		writer:     writer,
		cancel:     make(chan struct{}, 1),
		wg:         &sync.WaitGroup{},
		isOpen:     true,
	}

	log.wg.Add(1)
	go consumer(log)
	return log
}

func consumer(l *Logger) {
	defer l.wg.Done()
	for {
		select {
		case <-l.cancel:
			l.writer.Write(l.buffer.Bytes())
			return
		case log, ok := <-l.ch:
			if !ok {
				return
			}

			if l.buffer.Len() >= l.bufferSize {
				l.writer.Write(l.buffer.Bytes())
				l.buffer.Reset()
			}
			l.buffer.WriteString(log)
		}

	}
}

func (l *Logger) Close() {
	if !l.isOpen {
		return
	}

	close(l.ch)
	l.cancel <- struct{}{}
	l.wg.Wait()
	close(l.cancel)
	l.isOpen = false
}

func (l *Logger) Info(msg string) {
	if l.isOpen {
		l.ch <- fmt.Sprintf("%v - [INFO] - %v\n", time.Now(), msg)
		return
	}

	fmt.Printf("%v - [INFO] - %v\n", time.Now(), msg)
}

func (l *Logger) Debug(msg string) {
	if l.isOpen {
		l.ch <- fmt.Sprintf("%v - [DEBUG] - %v\n", time.Now(), msg)
		return
	}

	fmt.Printf("%v - [DEBUG] - %v\n", time.Now(), msg)
}

func (l *Logger) Warn(msg string) {
	if l.isOpen {
		l.ch <- fmt.Sprintf("%v - [WARN] - %v\n", time.Now(), msg)
		return
	}

	fmt.Printf("%v - [WARN] - %v\n", time.Now(), msg)
}

func (l *Logger) Error(msg string) {
	if l.isOpen {
		l.ch <- fmt.Sprintf("%v - [ERROR] - %v\n", time.Now(), msg)
		return
	}

	fmt.Printf("%v - [ERROR] - %v\n", time.Now(), msg)
}

func (l *Logger) Fatal(msg string) {
	if l.isOpen {
		l.ch <- fmt.Sprintf("%v - [FATAL] - %v\n", time.Now(), msg)
		return
	}

	fmt.Printf("%v - [FATAL] - %v\n", time.Now(), msg)
}