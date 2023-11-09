## Test locally

```bash
docker build -t sdk-react-demo .
docker run -it --rm -p 3000:3000 sdk-react-demo

```

## Deploy multi arch images

docker buildx version
docker buildx create --use

docker login

# -t registry.siteed.net/sdk-socket-server:latest
docker buildx build --platform linux/amd64,linux/arm64 . --push  . --push
