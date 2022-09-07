to compile the library:
`go build -buildmode=c-shared -o ecies.dylib`

Use `GOOS` and `GOARCH` environment variables accondingly to your needs.

For example:
`CGO_ENABLED=1 GOOS=darwin GOARCH=arm64 go build -buildmode=c-shared -o ecies.dylib`

Windows:
`sudo apt-get install gcc-mingw-w64`
`CGO_ENABLED=1 GOOS=windows GOARCH=amd64 CC=x86_64-w64-mingw32-gcc go build -buildmode=c-shared -o ecies.dylib`

MacOS:
`CGO_ENABLED=1 GOOS=darwind go build -buildmode=c-shared -o ecies.dylib`
`CGO_ENABLED=1 GOOS=darwind GOARCH=amd64 go build -buildmode=c-shared -o ecies.dylib`
`CGO_ENABLED=1 GOOS=darwind GOARCH=amd64 go build -buildmode=c-shared -o ecies.dylib`

Android:
https://github.com/golang/go/issues/20755

Resources:
https://github.com/vladimirvivien/go-cshared-examples
https://not.expert/creating-cross-platform-for-mobile-using-golang/
