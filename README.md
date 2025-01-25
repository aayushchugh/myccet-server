## Local setup

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file in the root directory and add the environment variables from the `.env.example` file.

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
```

3. Start database

```bash
docker compose up
```

4. start the development server

```bash
npm run start:dev
```

# Commands

| Command       | Use                          |
| ------------- | ---------------------------- |
| `start:dev`   | Start development server     |
| `db:generate` | Generate database migrations |
| `db:migrate`  | Apply database migrations    |
| `db:studio`   | Start drizzle studio         |
