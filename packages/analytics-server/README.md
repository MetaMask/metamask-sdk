# @metamask/analytics-server

Analytics server for MetaMask SDK.

## Prerequisites

- Node.js
- Yarn
- Docker (Optional, for containerized deployment)

## Local Development

1.  **Install Dependencies:**
    ```bash
    yarn install
    ```
2.  **Configure Environment:**
    Copy `.env.sample` (if it exists, otherwise create `.env`) and fill in the necessary environment variables.
3.  **Build the Code:**
    ```bash
    yarn build
    ```
4.  **Run the Server:**
    *   For production mode (uses compiled code):
        ```bash
        yarn start
        ```
    *   For development mode (uses ts-node):
        ```bash
        yarn dev
        ```

The server will typically run on the port specified in your `.env` file (defaulting to 2002 if not set).

## Running with Docker

1.  **Build the Docker Image:**
    ```bash
    docker build -t metamask/analytics-server .
    ```
2.  **Run the Docker Container:**
    Make sure to provide the necessary environment variables, for example by using an `.env` file and the `--env-file` flag.
    ```bash
    docker run -p 2002:2002 --env-file .env metamask/analytics-server
    ```
    *   Replace `2002:2002` if the server uses a different port.
    *   The container exposes port 2002 by default.

## Configuration

The server is configured using environment variables. These can be placed in a `.env` file in the root directory for local development. See `.env.sample` (if available) for required variables.

When running with Docker, environment variables should be passed to the container (e.g., using `--env-file` or `-e` flags).
