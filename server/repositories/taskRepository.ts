import { db } from '../db.js';
import { tasks, subTasks } from '../../src/db/schema.js';
import { eq, desc, and } from 'drizzle-orm';

export class TaskRepository {
  async createTask(data: typeof tasks.$inferInsert) {
    const [task] = await db.insert(tasks).values(data).returning();
    return task;
  }

  async getTaskById(id: number) {
    return db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      with: {
        subTasks: {
          orderBy: (subTasks, { asc }) => [asc(subTasks.order)],
        },
        assignee: {
          columns: { id: true, name: true, avatarUrl: true }
        },
        project: {
          columns: { id: true, name: true }
        }
      }
    });
  }

  async updateTask(id: number, data: Partial<typeof tasks.$inferInsert>) {
    const [task] = await db.update(tasks).set({ ...data, updatedAt: new Date() }).where(eq(tasks.id, id)).returning();
    return task;
  }

  async deleteTask(id: number) {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async listTasks(filters: { projectId?: number; assigneeId?: number; status?: string; priority?: string }, limit = 50, offset = 0) {
    const conditions = [];
    if (filters.projectId) conditions.push(eq(tasks.projectId, filters.projectId));
    if (filters.assigneeId) conditions.push(eq(tasks.assigneeId, filters.assigneeId));
    if (filters.status) conditions.push(eq(tasks.status, filters.status as any));
    if (filters.priority) conditions.push(eq(tasks.priority, filters.priority as any));

    return db.query.tasks.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(tasks.updatedAt)],
      limit,
      offset,
      with: {
        assignee: {
          columns: { id: true, name: true, avatarUrl: true }
        },
        project: {
          columns: { id: true, name: true }
        }
      }
    });
  }
}
