# Fast-Food Management System PoC

This project demonstrates a microservices architecture for a fast-food management system using Kong as API Gateway, Node.js for microservices, and PostgreSQL for sharding/replication.

## Structure

- `kong/`: Kong API Gateway config and docker-compose
- `services/orders/`: Orders microservice (Node.js)
- `services/menu/`: Menu microservice (Node.js)
- `db/`: PostgreSQL docker-compose and init scripts

## Quick Start

1. Start databases: `docker-compose -f db/docker-compose.yml up -d`
2. Start Kong: `docker-compose -f kong/docker-compose.yml up -d`
3. Install dependencies and run each service:
   - `cd services/orders && npm install && npm start`
   - `cd services/menu && npm install && npm start`

## Endpoints

- Orders: `GET http://localhost:3001/orders`
- Menu: `GET http://localhost:3002/menu`

## Notes

- Kong config is a placeholder; update `kong/kong.yml` as needed.
- Each PostgreSQL instance simulates a shard.
