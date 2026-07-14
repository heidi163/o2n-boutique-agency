import { db } from '../db.js';
import { users } from '../../src/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { ApiError } from '../middlewares/errorHandler.js';

export class UserService {
  async createUser(data: typeof users.$inferInsert) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async getUserByEmail(email: string) {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async getUserById(id: number) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async updateUser(id: number, data: Partial<typeof users.$inferInsert>) {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async listUsers() {
    return db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });
  }
}
