import * as vendorsService from './vendors.service.js';

export async function listVendors(req, res, next) {
  try {
    const lat    = req.query.lat    ? parseFloat(req.query.lat)    : undefined;
    const lng    = req.query.lng    ? parseFloat(req.query.lng)    : undefined;
    const radius = req.query.radius ? parseFloat(req.query.radius) : 50;
    const vendors = await vendorsService.listVendors({ lat, lng, radius });
    res.json(vendors);
  } catch (err) { next(err); }
}

export async function getVendorById(req, res, next) {
  try {
    const vendor = await vendorsService.getVendorById(req.params.id);
    res.json(vendor);
  } catch (err) { next(err); }
}

export async function registerVendor(req, res, next) {
  try {
    const vendor = await vendorsService.registerVendor(req.user.sub, req.body);
    res.status(201).json(vendor);
  } catch (err) { next(err); }
}

export async function updateMyVendor(req, res, next) {
  try {
    const vendor = await vendorsService.updateMyVendor(req.user.sub, req.body);
    res.json(vendor);
  } catch (err) { next(err); }
}

export async function getMyVendor(req, res, next) {
  try {
    const vendor = await vendorsService.getMyVendor(req.user.sub);
    res.json(vendor);
  } catch (err) { next(err); }
}
