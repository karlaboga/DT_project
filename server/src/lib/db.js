import Database from 'better-sqlite3';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = join(here, '..', 'data', 'products.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id        TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    price     REAL NOT NULL,
    site      TEXT NOT NULL,
    image     TEXT NOT NULL,
    url       TEXT NOT NULL,
    gender    TEXT NOT NULL CHECK (gender IN ('men', 'women')),
    category  TEXT NOT NULL CHECK (category IN ('upper_body', 'lower_body', 'outerwear', 'dress'))
  );
`);

const count = db.prepare('SELECT COUNT(*) as n FROM products').get();
if (count.n === 0) {
  const seedPath = join(here, '..', 'data', 'products.json');
  const products = JSON.parse(readFileSync(seedPath, 'utf8'));
  const insert = db.prepare(
    'INSERT INTO products (id, name, price, site, image, url, gender, category) VALUES (@id, @name, @price, @site, @image, @url, @gender, @category)'
  );
  const tx = db.transaction((items) => {
    for (const item of items) insert.run(item);
  });
  tx(products);
  console.log(`Seeded ${products.length} products`);
}

export default db;
