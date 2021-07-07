#!/usr/bin/env bash
echo "Creating mongo users..."
mongo admin --host localhost -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --eval "db = db.getSiblingDB('$MONGO_AUTHENTICATION_DATABASE');db.createUser({user: '$MONGO_NON_ROOT_USERNAME', pwd: '$MONGO_NON_ROOT_PASSWORD',roles: [{role: 'readWrite', db: '$MONGO_AUTHENTICATION_DATABASE'}]});"
echo "Mongo users created."
