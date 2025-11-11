import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const run = async () => {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const hash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { username },
    update: { password_hash: hash, role: 'manager' },
    create: { username, password_hash: hash, role: 'manager' }
  });
  console.log(`Seeded admin user '${username}'`);
};
run().then(()=>process.exit(0));
