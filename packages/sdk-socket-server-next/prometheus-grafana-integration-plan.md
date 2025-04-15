# Plan: Integrating Prometheus & Grafana into Docker Compose

This plan outlines the steps to add Prometheus and Grafana services to the `docker-compose.yml` file for monitoring the socket server application's metrics.

## Goal

To have a local, fully configured Prometheus and Grafana stack running via Docker Compose, automatically scraping metrics from the `app1`, `app2`, and `app3` services and allowing visualization in Grafana.

## Checklist

### Task 1: Define Prometheus Service in `docker-compose.yml`

-   [ ] **1.1:** Choose a specific Prometheus image tag (e.g., `prom/prometheus:v2.47.2`) for stability.
-   [ ] **1.2:** Add a new service definition named `prometheus` under the `services:` section.
-   [ ] **1.3:** Map the host port `9090` to the container port `9090` using the `ports` directive.
-   [ ] **1.4:** Define a volume mount to link a local `prometheus.yml` configuration file to `/etc/prometheus/prometheus.yml` inside the container.
-   [ ] **1.5:** (Optional but Recommended) Define a named volume (e.g., `prometheus_data`) and mount it to `/prometheus` inside the container for data persistence.
-   [ ] **1.6:** Specify the necessary Prometheus startup `command` arguments, including `--config.file`, `--storage.tsdb.path`, and `--web.enable-lifecycle`.
-   [ ] **1.7:** Add `depends_on` to ensure Prometheus starts after `app1`, `app2`, and `app3`.

### Task 2: Create Prometheus Configuration File (`prometheus.yml`)

-   [ ] **2.1:** Create a new file named `prometheus.yml` in the same directory as `docker-compose.yml`.
-   [ ] **2.2:** Define the `global` configuration block, setting `scrape_interval` and `evaluation_interval` (e.g., `15s`).
-   [ ] **2.3:** Define a `scrape_configs` block.
-   [ ] **2.4:** Add a `job_name` (e.g., `'socket-server'`) within `scrape_configs`.
-   [ ] **2.5:** Use `static_configs` to specify the scrape targets. List the service names and internal ports of the application instances (`'app1:4000'`, `'app2:4000'`, `'app3:4000'`). Prometheus will automatically target the `/metrics` endpoint on these.

### Task 3: Define Grafana Service in `docker-compose.yml`

-   [ ] **3.1:** Choose a specific Grafana image tag (e.g., `grafana/grafana:10.1.5`) for stability.
-   [ ] **3.2:** Add a new service definition named `grafana` under the `services:` section.
-   [ ] **3.3:** Map the host port `3000` to the container port `3000` using the `ports` directive.
-   [ ] **3.4:** Define a named volume (e.g., `grafana_data`) and mount it to `/var/lib/grafana` inside the container for data persistence (dashboards, settings, etc.).
-   [ ] **3.5:** Use the `environment` section to configure Grafana:
    -   Set admin user/password (`GF_SECURITY_ADMIN_USER`/`GF_SECURITY_ADMIN_PASSWORD`).
    -   Define and enable the default Prometheus data source (`GF_DATASOURCES_...`) pointing to the Prometheus service (`http://prometheus:9090`).
    -   (Optional) Enable anonymous access if desired (`GF_AUTH_ANONYMOUS_ENABLED`).
-   [ ] **3.6:** Add `depends_on` to ensure Grafana starts after the `prometheus` service.

### Task 4: Define Named Volumes in `docker-compose.yml`

-   [ ] **4.1:** Add a top-level `volumes:` section at the end of the `docker-compose.yml` file (if it doesn't already exist).
-   [ ] **4.2:** Define the named volume for Grafana: `grafana_data: {}`.
-   [ ] **4.3:** (Optional) If Prometheus persistence was added in 1.5, define the named volume: `prometheus_data: {}`.

### Task 5: Verification

-   [ ] **5.1:** Save changes to `docker-compose.yml` and the new `prometheus.yml`.
-   [ ] **5.2:** Run `docker compose up --build -d` (or `docker compose up -d` if no app changes).
-   [ ] **5.3:** Access the Prometheus UI in your browser (e.g., `http://localhost:9090`). Navigate to `Status` -> `Targets` to confirm `app1`, `app2`, `app3` are being scraped successfully ('UP' state).
-   [ ] **5.4:** Access the Grafana UI in your browser (e.g., `http://localhost:3000`).
-   [ ] **5.5:** Log in using the credentials defined in step 3.5 (or default `admin`/`admin`).
-   [ ] **5.6:** Navigate to `Connections` -> `Data sources`. Verify the `Prometheus` data source exists and is configured correctly.
-   [ ] **5.7:** Navigate to the `Explore` view, select the `Prometheus` data source, and try querying some metrics exported by your application (e.g., `socket_io_server_total_clients`).

## Next Steps

Once this plan is reviewed, we can proceed with implementing each task sequentially. 