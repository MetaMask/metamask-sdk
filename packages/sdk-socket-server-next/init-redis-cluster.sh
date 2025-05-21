#!/bin/bash
set -e

# Function to check if a redis node is ready
check_redis() {
    echo "Checking if Redis node '$1' is ready..."
    while true; do
        # Attempt to get a PONG response from the Redis node
        if redis-cli -h "$1" -p "$2" ping | grep -q "PONG"; then
            echo "Redis node '$1:$2' is ready."
            break
        else
            echo "Waiting for Redis node '$1:$2' to be ready..."
            sleep 2
        fi
    done
}

# Wait for all Redis nodes to be ready
echo "Checking readiness of Redis nodes..."

# Since we can't use arrays in sh, we list the nodes directly
check_redis "redis-master1" "6379"
check_redis "redis-master2" "6379"
check_redis "redis-master3" "6379"


# Since we can't pass arrays to redis-cli, we build the cluster create command manually
echo "All Redis nodes are ready. Creating Redis Cluster..."
echo "yes" | redis-cli --cluster create \
    redis-master1:6379 \
    redis-master2:6379 \
    redis-master3:6379 \
    --cluster-replicas 0 \
    --cluster-yes

echo "Redis Cluster created successfully."
