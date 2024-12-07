import * as ordersService from './orders.service.js';
import { z } from 'zod';

export async function createOrder(req, res, next) {
  try {
    const order = await ordersService.createOrder(req.user.sub, req.body);
    res.status(201).json(order);
  } catch (err) { next(err); }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await ordersService.getOrderById(req.user.sub, req.params.id, req.user.role);
    res.json(order);
  } catch (err) { next(err); }
}

export async function getBuyerOrders(req, res, next) {
  try {
    const orders = await ordersService.getBuyerOrders(req.user.sub);
    res.json(orders);
  } catch (err) { next(err); }
}

export async function getVendorOrders(req, res, next) {
  try {
    const orders = await ordersService.getVendorOrders(req.user.sub);
    res.json(orders);
  } catch (err) { next(err); }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = z.object({ status: z.string() }).parse(req.body);
    const order = await ordersService.updateOrderStatus(req.user.sub, req.params.id, status);
    res.json(order);
  } catch (err) { next(err); }
}
