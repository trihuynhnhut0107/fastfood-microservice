# Fast-Food Management System PoC

This project demonstrates a microservices architecture for a fast-food management system using Kong as API Gateway, Node.js for microservices, and PostgreSQL for sharding/replication.

## Structure

- `kong/`: Kong API Gateway config and docker-compose
- `services/orders/`: Orders microservice (Node.js)
- `services/menu/`: Menu microservice (Node.js)
- `db/`: PostgreSQL docker-compose and init scripts

## Quick Start

- Navigate to /fastfood-microservice
- Use docker compose up --build --scale orders-service=3 --scale menu-service=3 -d (This will run whole project with 3 instances of order service and menu service)
- Use node run-all-seeders.js to seed the dummy data into the project

## Endpoints

- Orders: `GET http://localhost:8000/orders`
- Menu: `GET http://localhost:8000/menu`
- All navigation is made via Kong API Gateway at port 8000 (default)

## Notes

- Kong config is a placeholder; update `kong/kong.yml` as needed.
- Each PostgreSQL instance simulates a shard.
