import * as paymentsService from './payments.service.js';

export async function createCheckout(req, res, next) {
  try {
    const result = await paymentsService.createCheckoutSession(req.user.sub, req.body);
    res.json(result);
  } catch (err) { next(err); }
}

export async function stripeWebhook(req, res, next) {
  try {
    const sig    = req.headers['stripe-signature'];
    const result = await paymentsService.handleWebhook(req.body, sig);
    res.json(result);
  } catch (err) { next(err); }
}

export async function connectOnboard(req, res, next) {
  try {
    const result = await paymentsService.createConnectOnboarding(req.user.sub);
    res.json(result);
  } catch (err) { next(err); }
}

export async function connectStatus(req, res, next) {
  try {
    const result = await paymentsService.getConnectStatus(req.user.sub);
    res.json(result);
  } catch (err) { next(err); }
}
