import { Router } from 'express';
import { z } from 'zod';
import {
  filterProducts,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from '../lib/products.js';
import { buildOutfit } from '../lib/recommend.js';

const router = Router();

const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  site: z.string().min(1),
  image: z.string().url(),
  url: z.string().url(),
  gender: z.enum(['men', 'women']),
  category: z.enum(['upper_body', 'lower_body', 'outerwear', 'dress']),
});

const listQuery = z.object({
  gender: z.enum(['men', 'women']).optional(),
  category: z.enum(['upper_body', 'lower_body', 'outerwear', 'dress']).optional(),
  site: z.string().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});

router.get('/products', (req, res) => {
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
  }
  const items = filterProducts(parsed.data);
  res.json({ count: items.length, items });
});

router.get('/products/all', (_req, res) => {
  const items = getAllProducts();
  res.json({ count: items.length, items });
});

router.get('/products/:id', (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post('/products', (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });
  }
  const newProduct = createProduct(parsed.data);
  res.status(201).json(newProduct);
});

router.put('/products/:id', (req, res) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });
  }
  const updated = updateProduct(req.params.id, parsed.data);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

router.delete('/products/:id', (req, res) => {
  const success = deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ error: 'Product not found' });
  res.status(204).end();
});

const recommendBody = z.object({
  gender: z.enum(['men', 'women']),
  style: z.enum(['Casual', 'Formal', 'Business', 'Sport', 'Streetwear']).default('Casual'),
  bodyType: z.enum(['Slim', 'Athletic', 'Average', 'Plus']).default('Average'),
  budget: z.number().positive().default(300),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  shoulder: z.number().positive().optional(),
  hip: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  seed: z.number().int().nonnegative().optional(),
});

router.post('/recommend', (req, res) => {
  const parsed = recommendBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', details: parsed.error.flatten() });
  }
  const result = buildOutfit(parsed.data);
  res.json(result);
});

export default router;
