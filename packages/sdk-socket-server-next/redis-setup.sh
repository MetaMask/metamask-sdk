#!/bin/sh

# Start Redis with cluster configuration. Adjust configuration as needed for your setup.
redis-server --appendonly yes --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --port 6379

# Keep the container running
tail -f /dev/null
