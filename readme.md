# Naboo Interview

Simple full‑stack app with a NestJS + MongoDB GraphQL backend and a Next.js frontend.

## Table of contents

- Tech stack
- Node.js version (nvm)
- Database setup
- Run the project
- GraphQL code generation
- Demo accounts
- Project notes (FR)

## Tech stack

Backend

- MongoDB
- NestJS
- Mongoose
- Data mapper pattern
- GraphQL

Frontend

- Next.js (pages router)
- Mantine UI
- Axios
- Vitest
- GraphQL
- Apollo Client

## Node.js version (nvm)

This project uses [nvm](https://github.com/nvm-sh/nvm). The required version is in `.nvmrc`.

```bash
nvm install
nvm use
```

If you don't have nvm, follow the [install instructions](https://github.com/nvm-sh/nvm#installing-and-updating).

---

## Database setup

### 1) Create your `.env`

```bash
cp back-end/.env.dist back-end/.env
# Then edit back-end/.env to set your MongoDB URI and secrets
```

### 2) Install MongoDB

#### macOS (Homebrew)

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Windows

- Download and install from the [official website](https://www.mongodb.com/try/download/community), or use winget:

```powershell
winget install -e --id MongoDB.Server
```

Then start the service from Services or run:

```powershell
net start MongoDB
```

#### Linux

- Use your distro package manager or follow the [official guide](https://www.mongodb.com/docs/manual/administration/install-on-linux/).
- Example (Ubuntu/Debian, MongoDB 6.0 via official repo):

```bash
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update && sudo apt-get install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod
```

MongoDB runs at `mongodb://localhost:27017` by default.

---

## Run the project

Backend

```bash
cd back-end
npm i
npm run start:dev
```

> ℹ️ Seeding is automatic on backend startup.

Frontend

```bash
cd front-end
npm i
npm run dev
```

---

## GraphQL code generation

Run this after GraphQL schema or operations change (frontend only):

```bash
cd front-end
npm run generate-types
```

---

## Demo accounts

These are seeded automatically. Use them at `/signin` on the frontend.

- User
  - Email: `user1@test.fr`
  - Password: `user1`
  - Name: John Doe
- Admin
  - Email: `admin@test.fr`
  - Password: `admin`
  - Name: Admin Boss
  - Role: admin

---

## Project notes (FR)

Revue de code — Fait ✅

- Amélioration de l’onboarding du projet (README plus explicite pour un meilleur setup)
- Ajout de nvm pour gérer la version de Node

Améliorations 🔧

- Ajout de Docker Compose (MongoDB + back-end + front-end) pour faciliter l’onboarding
- Exécuter npm audit/fix pour corriger les problèmes liés à certains packages (back et front)
- Breaking changes côté GraphQL et compatibilité avec la version de TypeScript
- Vulnérabilités critiques
- Ajouter des tests pour les fonctions existantes
- Ajouter des index Mongoose sur Activity pour les requêtes et tris fréquents
- Standardiser sur une seule factory pour le SSR/CSR (actuellement, il y a un mélange entre graphqlClient et createApolloClient). Il est préférable d’avoir un point d’entrée unique afin d’inclure systématiquement les cookies en SSR et l’en-tête d’authentification en CSR.
- Retirer le champ `token` de la DB.
- Retourner une erreur générique en cas d'erreur de login.
- Utiliser class-validator pour la validation des inputs

Remarques 💡

- Pour les favoris, un champ contenant les IDs des favoris a été ajouté dans la collection user
  (une collection de jointure est envisageable si un utilisateur a trop de favoris).
