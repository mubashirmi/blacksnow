## Getting Started

Requisites:

-   Node 16.0+ (using latest is fine)

-   Install node modules:
    -   `npm install -g pnpm`
    -   `pnpm install`

Run the development server:

```bash
npm run dev
# or
pnpm dev
```

NOTE: You will either need to setup a new AMPLIFY configuration or roll off the current amplify by implementing a new SDK for login and file uploads or reimplementing a new amplify instance. That's the only thing that should have to be done for a migration perspective. I left the current configurations in place even though we took down the infrastructure just so you could see the current configurations as that will be helpful to see how we had things configured.

Open [https://newblacksnow-mp7m.vercel.app](https://newblacksnow-mp7m.vercel.app) with your browser to see the result.
All files under /src/pages/api can be accessed using any REST client (ie: POST /api/whatever)

## File Structure

-   prisma
    -   migrations - Generated SQL migrations (this is read only shouldn't need to touch this unless something dire has happened)
    -   schema.prisma - Full Schema of the Database
-   src
    -   components
        -   List of components that are globally used throughout the app
    -   constants
        -   Any constants the system uses
    -   lib
        -   Any shared business logic or hooks used throughout the system
    -   pages
        -   api
            -   All of the NextJS apis
        -   List of all of the pages and routes
    -   store
        -   Global store using hookstate
    -   views
        -   All of the rendered views

## Tools used:

-   Husky - Pre commit/push script runner
-   Lint - Code formatter
-   Prettier - Code formatter
-   Prisma - Database ORM
-   Mantine - UI Library
-   NextJS - Platform Library
-   Winston - Logger

## Commands explained:

    "scripts": {
        "dev": "next dev", - Runs the dev Server
        "build": "next build", - Builds the production Files
        "start": "next start", - Starts the production Files
        "lint": "next lint", - Runs a check for file consistency using the linter
        "lint:fix": "next lint --fix", - Fixes everything that the runner can fix
        "prisma:generate": "npx prisma generate", - See Below
        "migrate": "prisma migrate dev --name", - See Below
        "seed": "ts-node prisma/seed.ts", - See Below
        "prettier": "prettier --write .", - Fixes formatting based on the prettierrc file
        "prepare": "husky install", - Husky Script needed
        "postinstall": "npx prisma generate" - Husky Script needed
    },

## Database Management

This project utilizes Prisma ORM to manage the database. The only edits you should need to make are on the prisma.schema file found under the /prisma folder

### Migrations

#### New Migrations

https://www.prisma.io/docs/orm/prisma-migrate/getting-started
To make changes to the database, make the appropriate changes to the prisma.schema file then run the following command:

`npm run prisma:migrate [name of the migration]`

This will create a folder in the /prisma/migrations folder that will be named: [CurrentTimeStamp]\_[name of the migration]
The migration will also apply the changes to the schema to the database model.

Sometimes the changes won't take because the database would be wiped, or there might be new unique fields without unique data. In these cases the migration must be handled manually.

#### Rollback

To rollback the migrations involves creating a down migration diff: https://www.prisma.io/docs/orm/prisma-migrate/workflows/generating-down-migrations

### Introspection and applying migrations to production

Introspection can be applied to an existing database by running:
`npx prisma db pull`

This will generate a schema file and an initial migration that will need to be marked as migrated.

To apply existing migrations to a new database run:
`npx prisma migrate dev`

### Troubleshooting

When making prisma changes on the schema, sometimes the migration does not sync with the new model. If you see type errors when accessing prisma models after making schema changes run the following commmand:

`npm run prisma:generate`

This will sync the schema to the new models, and should remove all errors. By default Generate runs on the `install` and `migrate` commands.

# blackice
