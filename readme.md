# Naboo interview

## What's used ?

backend

- mongodb
- nestjs
- mongoose
- data mapper pattern
- graphql

frontend

- nextjs (with page router)
- mantine-ui
- axios
- vitest
- graphql
- apollo client

## Node.js version (nvm)

This project uses [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions. The required version is specified in the `.nvmrc` file.

To install and use the correct Node.js version:

```bash
nvm install
nvm use
```

If you don't have nvm, follow the [install instructions](https://github.com/nvm-sh/nvm#installing-and-updating).

---

## Database setup

### 1. Create your `.env` file

Copy the example environment file and fill in the required values:

```bash
cp back-end/.env.dist back-end/.env
# Edit back-end/.env and set your MongoDB URI and other secrets
```

### 2. Install MongoDB

#### macOS (Homebrew)

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Windows

- Download and install the MongoDB Community Server from the [official website](https://www.mongodb.com/try/download/community), or use winget:

```powershell
winget install -e --id MongoDB.Server
```

Then start the service from the Services app or run:

```powershell
net start MongoDB
```

#### Linux

- Use your distro package manager or follow the [official installation guide](https://www.mongodb.com/docs/manual/administration/install-on-linux/).
- Example (Ubuntu/Debian, using MongoDB official repo for 6.0):

```bash
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update && sudo apt-get install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod
```

MongoDB will run locally at `mongodb://localhost:27017` by default on all platforms.

---

## How to launch project ?

npm run start:dev

backend

```bash
npm i
npm run start:dev
```

> ℹ️ Database seeding is automatic: when you start the backend, initial data is seeded during the app bootstrap process. No manual seed command is needed.

frontend

```bash
npm i

npm run dev
```

after graphql modification

```bash
# > frontend
npm run generate-types
```

## Connection informations

Demo accounts (seeded automatically):

- User:
  - Email: `user1@test.fr`
  - Password: `user1`
  - Name: John Doe
- Admin:
  - Email: `admin@test.fr`
  - Password: `admin`
  - Name: Admin Boss
  - Role: admin

Use these credentials to sign in on the frontend at `/signin`.
