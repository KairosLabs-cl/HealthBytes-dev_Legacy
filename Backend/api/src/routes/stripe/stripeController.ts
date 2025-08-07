import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from '../../db/index.js';
import { orderItemsTable, ordersTable } from '../../db/ordersSchema.js';

// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
// const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET!;



export async function getKeys(req: Request, res: Response) {
  res.status(503).json({ message: 'Stripe desactivado temporalmente para pruebas de base de datos.' });
}

export async function createPaymentIntent(req: Request, res: Response) {
  res.status(503).json({ message: 'Stripe desactivado temporalmente para pruebas de base de datos.' });
}


export async function webhook(req: Request, res: Response) {
  res.status(503).json({ message: 'Stripe desactivado temporalmente para pruebas de base de datos.' });
}
