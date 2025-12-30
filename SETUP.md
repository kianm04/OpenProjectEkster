# OpenProject Local Development Setup

This guide documents how to set up OpenProject for local development with a Dockerized PostgreSQL database.

## Prerequisites

Ensure the following are installed:

```bash
sudo apt-get update
sudo apt-get install git curl build-essential zlib1g-dev libyaml-dev libssl-dev libpq-dev libreadline-dev
```

### Ruby (via rbenv)

```bash
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
cd ~/.rbenv && src/configure && make -C src
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init - bash)"' >> ~/.bashrc
source ~/.bashrc

git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
rbenv install 3.4.7
rbenv global 3.4.7
```

### Node.js (via nodenv)

```bash
git clone https://github.com/nodenv/nodenv.git ~/.nodenv
cd ~/.nodenv && src/configure && make -C src
echo 'export PATH="$HOME/.nodenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(nodenv init -)"' >> ~/.bashrc
source ~/.bashrc

git clone https://github.com/nodenv/node-build.git $(nodenv root)/plugins/node-build
nodenv install 22.21.0
nodenv global 22.21.0
npm install npm@latest -g
```

### Docker

Ensure Docker and Docker Compose are installed.

## Project Structure

```
OpenProjectEkster/
├── docker-compose.yml      # PostgreSQL database container
├── SETUP.md                # This file
└── openproject/            # OpenProject source code
    └── config/
        └── database.yml    # Database configuration
```

## Setup Steps

### 1. Start PostgreSQL Database Container

From the project root (`/home/kianmatton/Desktop/OpenProjectEkster/`):

```bash
docker compose up -d
```

This starts a PostgreSQL 17 container with:
- **Container name**: `openproject-dev-db`
- **Port**: `5435` (mapped to internal port 5432)
- **User**: `openproject`
- **Password**: `openproject-dev-password`
- **Database**: `openproject_dev`

### 2. Create Test Database

```bash
docker exec openproject-dev-db createdb -U openproject openproject_test
```

### 3. Database Configuration

The `openproject/config/database.yml` is configured to use the Docker container:

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  host: localhost
  port: 5435
  username: openproject
  password: openproject-dev-password

development:
  <<: *default
  database: openproject_dev

test:
  <<: *default
  database: openproject_test
```

### 4. Run OpenProject Setup

```bash
cd openproject
bin/setup_dev
```

This will:
- Install Ruby dependencies (bundle install)
- Run database migrations
- Install npm packages
- Set up git hooks

### 5. Seed the Database (Optional)

```bash
cd openproject
RAILS_ENV=development bin/rails db:seed
```

## Running the Application

### Option 1: Using bin/dev (Recommended)

```bash
cd openproject
bin/dev
```

This starts all services (Rails, Angular, Good Job worker) in a single terminal.

### Option 2: Manual Startup

Run each in a separate terminal:

```bash
# Terminal 1: Rails server
cd openproject
RAILS_ENV=development bin/rails server

# Terminal 2: Angular frontend
cd openproject
npm run serve

# Terminal 3: Background worker
cd openproject
RAILS_ENV=development bundle exec good_job start
```

## Access

- **URL**: http://127.0.0.1:3000
- **Username**: `admin`
- **Password**: `admin`

## Docker Commands

### Start database
```bash
docker compose up -d
```

### Stop database
```bash
docker compose down
```

### View database logs
```bash
docker logs openproject-dev-db
```

### Access PostgreSQL CLI
```bash
docker exec -it openproject-dev-db psql -U openproject -d openproject_dev
```

### Reset database
```bash
docker compose down -v  # Removes volumes
docker compose up -d
docker exec openproject-dev-db createdb -U openproject openproject_test
cd openproject && bin/setup_dev
```

## Troubleshooting

### Port Already in Use

If port 5435 is already in use, edit both:
1. `docker-compose.yml` - change the port mapping
2. `openproject/config/database.yml` - update the port number

### Permission Denied Errors

The original error was caused by using a shared local PostgreSQL instance with tables from other applications. Using a dedicated Docker container resolves this by providing an isolated database environment.

### Database Connection Issues

1. Check container is running: `docker ps`
2. Check container health: `docker exec openproject-dev-db pg_isready -U openproject`
3. Verify port is accessible: `nc -zv localhost 5435`
