#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE policy_db;
    CREATE DATABASE claim_db;
    CREATE DATABASE approval_db;
EOSQL
