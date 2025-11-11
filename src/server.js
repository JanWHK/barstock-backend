import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('tiny'));

app.get('/health', (_req, res) => res.json({ ok: true }));

// Auth
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

function auth(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Unauthorized' }); }
}

// Items
app.get('/items', auth, async (_req, res) => {
  const items = await prisma.stockItem.findMany();
  res.json(items);
});

app.post('/items', auth, async (req, res) => {
  const { plu, name } = req.body;
  const item = await prisma.stockItem.create({ data: { plu, name } });
  res.status(201).json(item);
});

// History (previous counts)
app.get('/history', auth, async (_req, res) => {
  const history = await prisma.dailyCountItem.findMany({
    orderBy: { daily_count: { count_date: 'desc' } },
    take: 200,
    include: { stock_item: true, daily_count: true }
  });
  res.json(history);
});

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
