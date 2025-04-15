# SDK Socket Server - Dockerized Development & Simulation Guide

This guide explains how to set up and run the SDK socket server using Docker Compose for different purposes:
1.  **Development Mode (Docker + Auto-Reload):** For coding and debugging within a Docker container, using auto-reloading code changes and integrated monitoring.
2.  **Scalable Environment Simulation:** For testing the application in a multi-instance setup with load balancing, a Redis cluster, and integrated monitoring.

## Prerequisites

- Node.js and Yarn installed (for dependency management, though code runs in Docker)
- Docker and Docker Compose installed
- Ngrok account and CLI tool installed (optional, for external access testing)
- Copy `.env.sample` to `.env` and configure as needed (Note: `REDIS_NODES` in `.env` is ignored by Docker services, which use overrides in `docker-compose.yml`).

## Mode 1: Development (Docker + Auto-Reload + Monitoring)

This mode runs the development server (`yarn debug` via `nodemon`) *inside* the `appdev` Docker container, which mounts your local code. It uses the `cache` Redis instance and integrates with Prometheus/Grafana.

**Features:**
*   ✅ Automatic code reloading on file changes (via `appdev` service)
*   ✅ Includes Prometheus/Grafana monitoring
*   ✅ Runs app in a containerized environment (closer to production)

**Setup & Run:**

```bash
# 1. Start background services (Redis, Prometheus, Grafana)
docker compose up -d cache prometheus grafana loki promtail

# 2. Start the development application server in the foreground
# Logs will stream directly to your terminal.
# Use Ctrl+C to stop.
docker compose up appdev
```

*   **Access Server:** `http://localhost:4000`
*   **Access Prometheus:** `http://localhost:9090`. Check `Status` -> `Targets`. You should see the `appdev` job scraping `appdev:4000`.
*   **Access Grafana:** `http://localhost:3444` (Login: `gadmin` / `admin`). Use the `Prometheus` datasource.
*   **View Logs:** Logs stream directly when running `docker compose up appdev`. If you later run it with `-d`, use `docker compose logs -f appdev`.

## Mode 2: Scalable Environment Simulation (Docker Compose)

This mode simulates a production-like deployment with multiple app instances (`app1`, `app2`, `app3`), Redis cluster, load balancer (`nginx`), and monitoring.

**Features:**
*   ✅ Simulates horizontal scaling (`app1`, `app2`, `app3`)
*   ✅ Includes load balancer (`nginx`) & Redis Cluster (`redis-master1..3`)
*   ✅ Integrates Prometheus (scraping `app1..3`) & Grafana
*   ❌ **NO** automatic code reloading for `app1..3` (requires image rebuild)
*   ❌ Slower startup

**Setup & Run:**

```bash
# 1. (Optional) Build/Rebuild application images if code has changed
docker compose build app1 app2 app3

# 2. Initialize Redis Cluster (if needed)
docker compose up redis-cluster-init

# 3. Start all services for the scalable environment
docker compose up -d redis-master1 redis-master2 redis-master3 app1 app2 app3 nginx prometheus grafana loki promtail
```

*   **Access Application:** Via Nginx load balancer at `http://localhost:8080`.
*   **Access Prometheus:** `http://localhost:9090` (Check `Status` -> `Targets`. You should see `socket-server-scaled` job scraping `app1..3`. The `appdev` target will likely be DOWN unless you explicitly started it).
*   **Access Grafana:** `http://localhost:3444` (Login: `gadmin` / `admin`).

**Deploying Code Changes in Mode 2:**
Requires image rebuild and container restart:
1.  `docker compose stop app1 app2 app3`
2.  `docker compose build app1 app2 app3`
3.  `docker compose up -d --force-recreate app1 app2 app3`

## Using Ngrok for External Access

If you need to expose either the development server (`Mode 1`) or the Dockerized load balancer (`Mode 2`) to the internet:

1.  **Identify the Port:**
    *   Mode 1 (`appdev`): `4000`
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
5.  **Configure Your DApp (if applicable):** Ensure your DApp points to the correct server URL.

## Additional Notes

- **Environment Variables**: Other variables from `.env` are still loaded by services with `env_file: - .env`.
- **Redis Data**: Redis data is persisted in Docker volumes. Use `docker compose down -v` to remove data volumes.
- **Logs**: Check container logs using `docker compose logs <service_name>` (e.g., `docker compose logs app1`).
- **Security**: Be cautious when exposing services via Ngrok.
