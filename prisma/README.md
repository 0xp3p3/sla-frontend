
# Prisma cheatsheet

## Setting up / modifying the database
- Install: `npm install prisma --save-dev`
- Set up `prisma` in the current project: `npx prisma init`
- Update the DB URL: `DATABASE_URL` environment variable
- Update the tables in the DB: `npx prisma db push` (after updating `prisma/schema.prisma`)
- Modifying the DB: `npx prisma studio`

## Using the client
- Install: `npm install @prisma/client`
- Update the client after udpating the schema: `npx prisma generate`
