import * as usersService from './users.service.js';

export async function getMe(req, res, next) {
  try {
    const user = await usersService.getMe(req.user.sub);
    res.json(user);
  } catch (err) { next(err); }
}

export async function updateMe(req, res, next) {
  try {
    const user = await usersService.updateMe(req.user.sub, req.body);
    res.json(user);
  } catch (err) { next(err); }
}

export async function listAddresses(req, res, next) {
  try {
    const addresses = await usersService.listAddresses(req.user.sub);
    res.json(addresses);
  } catch (err) { next(err); }
}

export async function addAddress(req, res, next) {
  try {
    const address = await usersService.addAddress(req.user.sub, req.body);
    res.status(201).json(address);
  } catch (err) { next(err); }
}

export async function deleteAddress(req, res, next) {
  try {
    await usersService.deleteAddress(req.user.sub, req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
}
