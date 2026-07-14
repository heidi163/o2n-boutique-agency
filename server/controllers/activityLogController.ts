import { Request, Response } from 'express';
import { db } from '../db.js';
import { activityLogs, users } from '../../src/db/schema.js';
import { desc, eq } from 'drizzle-orm';

export const listActivityLogs = async (req: Request, res: Response) => {
  try {
    const logs = await db
      .select({
        id: activityLogs.id,
        entityType: activityLogs.entityType,
        entityId: activityLogs.entityId,
        action: activityLogs.action,
        changes: activityLogs.changes,
        createdAt: activityLogs.createdAt,
        user: {
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        }
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.changedBy, users.id))
      .orderBy(desc(activityLogs.createdAt))
      .limit(50); // Fetch top 50 recent activities for now

    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
