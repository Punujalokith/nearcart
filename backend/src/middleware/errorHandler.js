import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: 'Validation failed',
      issues: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  const status  = err.statusCode || err.status || 500;
  const message = err.message    || 'Internal server error';

  if (status === 500) {
    console.error('[ERROR]', err);
  }

  res.status(status).json({ error: message });
}
