#!/bin/sh
# wait-for-postgres.sh
# https://docs.docker.com/compose/startup-order/

# Wrapper script to perform a more application-specific health check. 
# Here we want to wait until Postgres is ready to accept the PayID SQL scripts.

# Exit immediately if a command exits with a non-zero status.
set -e

# In docker-compose.yml, the command value is:
# command:
# [
#   '/opt/payid/docker/wait-for-postgres.sh',
#   'db',                               => $1
#   'node',                             => $2
#   '/opt/payid/build/src/index.js',    => $3
# ]
# So we will have:
# /opt/payid/docker/wait-for-postgres.sh $1 $2 $3
# The database hostname ("db" service) is in position 1
DB_HOSTNAME="$1"

# shift will move to the left the parameters, so $1 is removed, $2 becomes $1 and $3 becomes $2
# https://www.youtube.com/watch?v=48j0kxOFKZE
shift

# $* concatenates the remaining parameters, it is equivalent to "$1 $2", which is now (after the shift): node /opt/payid/build/src/index.js
CMD=$*

# Check that the Postgres is ready to execute SQL scripts, if not we wait 1 second and try again
# \q means we want to quit psql
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOSTNAME" -U "postgres" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
  
>&2 echo "Postgres is up - executing command"

# The eval built-in will feed the command to the shell, which will effectively execute the command. Needed as we use $* above.
eval exec "$CMD"