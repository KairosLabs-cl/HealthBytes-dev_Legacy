import { Request, Response } from 'express';
import { db } from '../../db/index.js';
import { productsTable } from '../../db/productsSchema.js';
import { eq, or, ilike } from 'drizzle-orm';
import _ from 'lodash';

export async function listProducts(req: Request, res: Response) {
  try {
    // aca lee el parmetro de búsqueda de query string
    const { search } = req.query;
    
    let products;
    
    // filtra productos por nombre o descripción si hay búsqueda
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      products = await db
        .select()
        .from(productsTable)
        .where(
          or(
            ilike(productsTable.name, searchTerm),
            ilike(productsTable.description, searchTerm)
          )
        );
    } else {
      // si no hay una busqyeda retorna todos los productos
      products = await db.select().from(productsTable);
    }
    
    res.json(products);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, Number(id)));

    if (!product) {
      res.status(404).send({ message: 'Product not found' });
    } else {
      res.json(product);
    }
  } catch (e) {
    res.status(500).send(e);
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    console.log(req.userId);

    const [product] = await db
      .insert(productsTable)
      .values(req.cleanBody)
      .returning();
    res.status(201).json(product);
  } catch (e) {
    res.status(500).send(e);
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const updatedFields = req.cleanBody;

    const [product] = await db
      .update(productsTable)
      .set(updatedFields)
      .where(eq(productsTable.id, id))
      .returning();

    if (product) {
      res.json(product);
    } else {
      res.status(404).send({ message: 'Product was not found' });
    }
  } catch (e) {
    res.status(500).send(e);
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const [deletedProduct] = await db
      .delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning();
    if (deletedProduct) {
      res.status(204).send();
    } else {
      res.status(404).send({ message: 'Product was not found' });
    }
  } catch (e) {
    res.status(500).send(e);
  }
}
