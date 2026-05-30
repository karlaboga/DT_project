import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = join(here, '..', 'data', 'products.json');

let PRODUCTS = JSON.parse(readFileSync(dataPath, 'utf8'));

function saveToFile() {
  writeFileSync(dataPath, JSON.stringify(PRODUCTS, null, 2), 'utf8');
}

export function getAllProducts() {
  return PRODUCTS;
}

export function filterProducts({ gender, category, maxPrice, site } = {}) {
  return PRODUCTS.filter((p) => {
    if (gender && p.gender !== gender) return false;
    if (category && p.category !== category) return false;
    if (site && p.site.toLowerCase() !== site.toLowerCase()) return false;
    if (maxPrice != null && p.price > maxPrice) return false;
    return true;
  });
}

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

export function createProduct(data) {
  const newProduct = {
    id: `prod-${Date.now()}`,
    ...data,
  };
  PRODUCTS.push(newProduct);
  saveToFile();
  return newProduct;
}

export function updateProduct(id, data) {
  const index = PRODUCTS.findIndex((p) => p.id === id);
  if (index === -1) return null;

  PRODUCTS[index] = { ...PRODUCTS[index], ...data, id }; // Ensure ID doesn't change
  saveToFile();
  return PRODUCTS[index];
}

export function deleteProduct(id) {
  const index = PRODUCTS.findIndex((p) => p.id === id);
  if (index === -1) return false;

  PRODUCTS.splice(index, 1);
  saveToFile();
  return true;
}
