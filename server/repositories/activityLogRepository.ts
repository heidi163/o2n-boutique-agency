import { db } from '../db.js';
import { activityLogs } from '../../src/db/schema.js';
import { desc, eq, and, gte, lte } from 'drizzle-orm';

export class ActivityLogRepository {
  async createLog(data: typeof activityLogs.$inferInsert) {
    const [log] = await db.insert(activityLogs).values(data).returning();
    return log;
  }

  async getLogs(filters: { userId?: number; entityType?: string; entityId?: number; startDate?: Date; endDate?: Date }, limit = 50, offset = 0) {
    const conditions = [];
    if (filters.userId) conditions.push(eq(activityLogs.changedBy, filters.userId));
    if (filters.entityType) conditions.push(eq(activityLogs.entityType, filters.entityType));
    if (filters.entityId) conditions.push(eq(activityLogs.entityId, filters.entityId));
    if (filters.startDate) conditions.push(gte(activityLogs.createdAt, filters.startDate));
    if (filters.endDate) conditions.push(lte(activityLogs.createdAt, filters.endDate));

    return db.query.activityLogs.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(activityLogs.createdAt)],
      limit,
      offset,
      with: {
        changer: {
          columns: {
            id: true,
            name: true,
            avatarUrl: true,
          }
        }
      }
    });
  }
}
