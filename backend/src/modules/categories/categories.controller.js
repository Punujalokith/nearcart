import * as categoriesService from './categories.service.js';

export async function listCategories(req, res, next) {
  try {
    const categories = await categoriesService.listCategories();
    res.json(categories);
  } catch (err) { next(err); }
}
