import db from './db.js';

const allStmt = db.prepare('SELECT * FROM products ORDER BY id');
const byIdStmt = db.prepare('SELECT * FROM products WHERE id = ?');
const insertStmt = db.prepare(
  'INSERT INTO products (id, name, price, site, image, url, gender, category) VALUES (@id, @name, @price, @site, @image, @url, @gender, @category)'
);
const updateStmt = db.prepare(
  'UPDATE products SET name = @name, price = @price, site = @site, image = @image, url = @url, gender = @gender, category = @category WHERE id = @id'
);
const deleteStmt = db.prepare('DELETE FROM products WHERE id = ?');

export function getAllProducts() {
  return allStmt.all();
}

export function filterProducts({ gender, category, maxPrice, site } = {}) {
  const clauses = [];
  const params = [];
  if (gender) { clauses.push('gender = ?'); params.push(gender); }
  if (category) { clauses.push('category = ?'); params.push(category); }
  if (maxPrice != null) { clauses.push('price <= ?'); params.push(Number(maxPrice)); }
  if (site) { clauses.push('LOWER(site) = LOWER(?)'); params.push(site); }
  const sql = clauses.length ? `SELECT * FROM products WHERE ${clauses.join(' AND ')} ORDER BY id` : 'SELECT * FROM products ORDER BY id';
  return db.prepare(sql).all(...params);
}

export function getProductById(id) {
  return byIdStmt.get(id) || null;
}

export function createProduct(data) {
  const product = {
    id: `prod-${Date.now()}`,
    ...data,
  };
  insertStmt.run(product);
  return product;
}

export function updateProduct(id, data) {
  const existing = byIdStmt.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...data, id };
  updateStmt.run(updated);
  return updated;
}

export function deleteProduct(id) {
  const existing = byIdStmt.get(id);
  if (!existing) return false;
  deleteStmt.run(id);
  return true;
}
