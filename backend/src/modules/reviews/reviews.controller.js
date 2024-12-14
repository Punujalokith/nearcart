import * as reviewsService from './reviews.service.js';

export async function createReview(req, res, next) {
  try {
    const review = await reviewsService.createReview(req.user.sub, req.body);
    res.status(201).json(review);
  } catch (err) { next(err); }
}

export async function getProductReviews(req, res, next) {
  try {
    const result = await reviewsService.getProductReviews(req.params.productId);
    res.json(result);
  } catch (err) { next(err); }
}
