# SDK Socket Server - Local Development & Simulation Guide

This guide explains how to set up and run the SDK socket server for different purposes:
1.  **Local Development:** For quick coding, debugging, and testing with auto-reloading code changes.
2.  **Scalable Environment Simulation:** For testing the application in a multi-instance setup with load balancing, a Redis cluster, and integrated monitoring.

## Prerequisites

- Node.js and Yarn installed
- Docker and Docker Compose installed
- Ngrok account and CLI tool installed (optional, for external access testing)
- Copy `.env.sample` to `.env` and configure as needed.

## Mode 1: Local Development (Fast Iteration)

This mode is ideal for active development and debugging. It uses your local Node.js environment for the application (with `nodemon` for auto-reload) and a single Redis instance running in Docker.

**Features:**
*   ✅ Fast startup
*   ✅ Automatic code reloading on file changes (`yarn debug`)
*   ✅ Easy debugging using standard Node.js tools
*   ❌ Does not simulate scaling or load balancing
*   ❌ Does not include Prometheus/Grafana monitoring out-of-the-box

**Setup & Run:**

```bash
# 1. Start the single Redis instance ('cache') in Docker
docker compose up -d cache

# 2. Run the application locally using nodemon for auto-reload
yarn debug
```

Your application server will be available (likely at `http://localhost:4000`) and will automatically restart when you modify and save source files.

## Mode 2: Scalable Environment Simulation (Docker Compose)

This mode uses Docker Compose to run the entire stack, simulating a production-like deployment with multiple application instances, a Redis cluster, a load balancer (Nginx), and monitoring tools (Prometheus, Grafana).

**Features:**
*   ✅ Simulates horizontal scaling (`app1`, `app2`, `app3`)
*   ✅ Includes a load balancer (`nginx`)
*   ✅ Uses a multi-node Redis Cluster (`redis-master1..3`) for HA/scaling tests
*   ✅ Integrates Prometheus for metrics scraping from all app instances
*   ✅ Integrates Grafana for metrics visualization
*   ❌ **NO** automatic code reloading for `app1`, `app2`, `app3` (requires image rebuild)
*   ❌ Slower startup compared to local development

**Setup & Run:**

This mode requires building the application images first.

```bash
# 1. (Optional) Build/Rebuild application images if code has changed
docker compose build app1 app2 app3 # Add other services if their Dockerfiles changed

# 2. Initialize the Redis Cluster (only needed once or after clearing volumes)
docker compose up redis-cluster-init

# 3. Start all services for the scalable environment in the background
docker compose up -d redis-master1 redis-master2 redis-master3 app1 app2 app3 nginx prometheus grafana

# Optional: Check Redis Cluster Status
# yarn docker:redis:check
```

**Accessing the System:**

*   **Application:** Access via the Nginx load balancer at `http://localhost:8080`.
*   **Prometheus:** `http://localhost:9090` (Check `Status` -> `Targets`)
*   **Grafana:** `http://localhost:3000` (Login: `admin` / `admin`. Explore `Prometheus` datasource)

**Deploying Code Changes in this Mode:**
Since `app1`, `app2`, `app3` run from pre-built Docker images, changes to your local source code **are not** automatically reflected. To deploy changes:
1.  Stop the running app containers (optional, but recommended): `docker compose stop app1 app2 app3`
2.  Rebuild the application images: `docker compose build app1 app2 app3`
3.  Restart the services to use the new images: `docker compose up -d --force-recreate app1 app2 app3`

## Using Ngrok for External Access

If you need to expose either your local development server (`Mode 1`) or the Dockerized load balancer (`Mode 2`) to the internet (e.g., for testing with MetaMask Mobile):

1.  **Identify the Port:**
    *   Mode 1 (`yarn debug`): Typically `4000`
    *   Mode 2 (Nginx): `8080`
2.  **Start Ngrok:**
    ```bash
    # For Mode 1
    ngrok http 4000
    # For Mode 2
    ngrok http 8080
    ```
3.  Note the generated `https` URL from Ngrok.
4.  **Configure MetaMask Mobile:** Set `MM_SDK.SERVER_URL` in the app to the Ngrok `https` URL.
5.  **Configure Your DApp (if applicable):** Ensure your DApp points to the correct server URL (either the local URL for Mode 1 or the Ngrok URL).

## Additional Notes

- **Environment Variables**: Ensure `.env` is correctly configured for database connections, secrets, etc.
- **Redis Data**: Redis data is persisted in Docker volumes (`cache_data`, `redis_cluster_data`, etc. - check `docker-compose.yml`). Use `docker compose down -v` to remove data volumes when stopping containers if you need a clean slate.
- **Logs**: Check container logs using `docker compose logs <service_name>` (e.g., `docker compose logs app1`).
- **Security**: Be cautious when exposing services via Ngrok.
