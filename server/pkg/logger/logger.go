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

	Reset   = "\033[0m"
	Blue    = "\033[34m"
	Cyan    = "\033[36m"
	Yellow  = "\033[33m"
	Red     = "\033[31m"
	Magenta = "\033[35m"
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
	level := fmt.Sprintf("%s[INFO]%s", Blue, Reset)
	if l.isOpen {
		l.ch <- fmt.Sprintf("%v - %v - %v\n", time.Now(), level, msg)
		return
	}
	fmt.Printf("%v - %v - %v\n", time.Now(), level, msg)
}

func (l *Logger) Debug(msg string) {
	level := fmt.Sprintf("%s[DEBUG]%s", Cyan, Reset)
	if l.isOpen {
		l.ch <- fmt.Sprintf("%v - %v - %v\n", time.Now(), level, msg)
		return
	}
	fmt.Printf("%v - %v - %v\n", time.Now(), level, msg)
}

func (l *Logger) Warn(msg string) {
	level := fmt.Sprintf("%s[WARN]%s", Yellow, Reset)
	if l.isOpen {
		l.ch <- fmt.Sprintf("%v - %v - %v\n", time.Now(), level, msg)
		return
	}
	fmt.Printf("%v - %v - %v\n", time.Now(), level, msg)
}

func (l *Logger) Error(msg string) {
	level := fmt.Sprintf("%s[ERROR]%s", Red, Reset)
	if l.isOpen {
		l.ch <- fmt.Sprintf("%v - %v - %v\n", time.Now(), level, msg)
		return
	}
	fmt.Printf("%v - %v - %v\n", time.Now(), level, msg)
}

func (l *Logger) Fatal(msg string) {
	level := fmt.Sprintf("%s[FATAL]%s", Magenta, Reset)
	if l.isOpen {
		l.ch <- fmt.Sprintf("%v - %v - %v\n", time.Now(), level, msg)
		return
	}
	fmt.Printf("%v - %v - %v\n", time.Now(), level, msg)
}
