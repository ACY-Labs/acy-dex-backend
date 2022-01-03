#!/usr/bin/env bash
echo "Creating mongo users..."

# Create DB for each chain
# bsc-main
mongo admin --host localhost -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --eval \
"
    db = db.getSiblingDB('$MONGO_BSCMAIN_DATABASE');
    db.createUser({
        user: '$MONGO_BSCMAIN_ADMIN_USERNAME', 
        pwd: '$MONGO_BSCMAIN_ADMIN_PASSWORD',
        roles: [{
            role: 'readWrite', 
            db: '$MONGO_BSCMAIN_DATABASE'
        }]
    });
"

mongo admin --host localhost -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --eval \
"
    db = db.getSiblingDB('$MONGO_BSCTEST_DATABASE');
    db.createUser({
        user: '$MONGO_BSCTEST_ADMIN_USERNAME', 
        pwd: '$MONGO_BSCTEST_ADMIN_PASSWORD',
        roles: [{
            role: 'readWrite', 
            db: '$MONGO_BSCTEST_DATABASE'
        }]
    });
"

mongo admin --host localhost -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --eval \
"
    db = db.getSiblingDB('$MONGO_POLYGONMAIN_DATABASE');
    db.createUser({
        user: '$MONGO_POLYGONMAIN_ADMIN_USERNAME', 
        pwd: '$MONGO_POLYGONMAIN_ADMIN_PASSWORD',
        roles: [{
            role: 'readWrite', 
            db: '$MONGO_POLYGONMAIN_DATABASE'
        }]
    });
"

# 暂时为了方便，设置为readWrite，只会改成read
mongo admin --host localhost -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --eval \
"
    db = db.getSiblingDB('admin');
    db.createUser({ 
        user: '$MONGO_READONLY_USERNAME', 
        pwd: '$MONGO_READONLY_PASSWORD', 
        roles: [{
            role: 'readWrite',
            db: '$MONGO_BSCMAIN_DATABASE'
        }, {
            role: 'readWrite',
            db: '$MONGO_BSCTEST_DATABASE'
        }, {
            role: 'readWrite',
            db: '$MONGO_POLYGONMAIN_DATABASE'
        }]
    });
"

echo "Mongo db & users created."
