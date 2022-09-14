to compile the library:
`go build -buildmode=c-shared -o ecies.dylib`

Use `GOOS` and `GOARCH` environment variables accondingly to your needs.

For example:
`CGO_ENABLED=1 GOOS=darwin GOARCH=arm64 go build -buildmode=c-shared -o ecies.dylib`

For MacOS:
`CGO_ENABLED=1 GOOS=darwind go build -buildmode=c-shared -o ecies.dylib`
`CGO_ENABLED=1 GOOS=darwind GOARCH=amd64 go build -buildmode=c-shared -o ecies.dylib`
`CGO_ENABLED=1 GOOS=darwind GOARCH=amd64 go build -buildmode=c-shared -o ecies.dylib`

For Windows:
`CGO_ENABLED=1 GOOS=windows GOARCH=amd64 CC=x86_64-w64-mingw32-gcc go build -buildmode=c-shared -o ecies.dylib`

For Android:
`gomobile bind --target=android`

For iOS:
`gomobile bind --target=ios`

Resources:
https://github.com/vladimirvivien/go-cshared-examples
https://pkg.go.dev/golang.org/x/mobile/cmd/gomobile
https://pkg.go.dev/golang.org/x/mobile/cmd/gomobile#hdr-Build_a_library_for_Android_and_iOS
https://not.expert/creating-cross-platform-for-mobile-using-golang/
