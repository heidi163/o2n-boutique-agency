import { db } from '../db.js';
import { clients } from '../../src/db/schema.js';
import { eq, desc, ilike, or } from 'drizzle-orm';

export class ClientRepository {
  async createClient(data: typeof clients.$inferInsert) {
    const [client] = await db.insert(clients).values(data).returning();
    return client;
  }

  async getClientById(id: number) {
    return db.query.clients.findFirst({
      where: eq(clients.id, id),
    });
  }

  async updateClient(id: number, data: Partial<typeof clients.$inferInsert>) {
    const [client] = await db.update(clients).set(data).where(eq(clients.id, id)).returning();
    return client;
  }

  async deleteClient(id: number) {
    await db.delete(clients).where(eq(clients.id, id));
  }

  async listClients(search?: string, limit = 50, offset = 0) {
    let whereCondition = undefined;
    if (search) {
      whereCondition = or(
        ilike(clients.name, `%${search}%`),
        ilike(clients.email, `%${search}%`),
        ilike(clients.company, `%${search}%`)
      );
    }
    
    return db.query.clients.findMany({
      where: whereCondition,
      orderBy: [desc(clients.createdAt)],
      limit,
      offset,
    });
  }
}
