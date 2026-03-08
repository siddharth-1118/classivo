const fs = require('fs');
const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" 
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  STUDENT
  VOLUNTEER
}

model User {
  id           String     @id @default(uuid())
  name         String
  email        String     @unique
  passwordHash String
  role         Role
  createdAt    DateTime   @default(now())
}
`;
fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema written');
