import * as productsService from './products.service.js';

export async function listProducts(req, res, next) {
  try {
    const result = await productsService.listProducts(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getProductById(req, res, next) {
  try {
    const product = await productsService.getProductById(req.params.id);
    res.json(product);
  } catch (err) { next(err); }
}

export async function createProduct(req, res, next) {
  try {
    const product = await productsService.createProduct(req.user.sub, req.body);
    res.status(201).json(product);
  } catch (err) { next(err); }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await productsService.updateProduct(req.user.sub, req.params.id, req.body);
    res.json(product);
  } catch (err) { next(err); }
}

export async function deleteProduct(req, res, next) {
  try {
    await productsService.deleteProduct(req.user.sub, req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
}

export async function uploadImages(req, res, next) {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'No images provided' });
    }
    const result = await productsService.uploadProductImages(req.user.sub, req.params.id, req.files);
    res.json(result);
  } catch (err) { next(err); }
}
