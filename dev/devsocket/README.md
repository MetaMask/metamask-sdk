# DevSocket

> **WARNING**: This is a development package only, used internally by developers. It is not intended for production use or distribution.

# Description 
Simple utility to interact with a running process via a websocket.

Useful to debug both side of the communication layer.

To use open two terminals connecting to the same or different webservers so you can verify communications are synchronized accross servers.

# How-to
In order to run this project you need to have 1 or multiple webservers that use ws so you can verify the connections.

```bash
SOCKET_SERVER=http://localhost:4000 yarn debug
SOCKET_SERVER=http://localhost:4001 yarn debug

# Once connected on multiple server you can interact with orders such as:
# join <channel>
# leave <channel>
# message <channel> <message>
```
