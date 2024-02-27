# DevSocket

Simple utility to interact with a running process via a websocket.

Useful to debug both side of the communication layer.

To use open two terminals connecting to the same or different webservers so you can verify communications are synchronized accross servers.

```bash
SOCKET_SERVER=http://localhost:4000 yarn debug
SOCKET_SERVER=http://localhost:4001 yarn debug

# Once connected on multiple server you can interact with orders such as:
# join <channel>
# join 804626d4-aecd-400a-9d77-6d9e5ca14f69
# leave <channel>
# message <channel> <message>
```
