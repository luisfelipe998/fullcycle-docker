FROM golang:1.20 as builder

WORKDIR /app
COPY main.go . 
RUN go mod init github.com/luisfelipe998/go-challenge && \
    go mod tidy && \
    go build

FROM scratch

WORKDIR /app
COPY --from=builder /app/go-challenge .
ENTRYPOINT [ "./go-challenge" ]