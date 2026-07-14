import { Request, Response } from 'express';
import { db } from '../db.js';
import { tasks, users } from '../../src/db/schema.js';
import { eq, count, sql } from 'drizzle-orm';

export const getPerformance = async (req: Request, res: Response) => {
  try {
    // A simplified performance stats view for MVP.
    // Fetch all members, count total tasks, done tasks, overdue tasks.
    
    // We fetch raw users and tasks and map them to build stats easily
    const allUsers = await db.select().from(users);
    const allTasks = await db.select().from(tasks);

    const now = new Date();

    const stats = allUsers.map(user => {
      const userTasks = allTasks.filter(t => t.assigneeId === user.id);
      
      const total = userTasks.length;
      const done = userTasks.filter(t => t.status === 'DONE').length;
      const overdue = userTasks.filter(t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now).length;
      
      // Calculate avg completion time just as a mock for now or simple diff if we had 'completed_at'
      // Since we don't have completed_at easily, we'll mock avg hours for MVP
      const avgHours = userTasks.length > 0 ? Math.floor(Math.random() * 20) + 4 : 0; 
      
      return {
        userId: user.id,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        totalTasks: total,
        completedTasks: done,
        overdueTasks: overdue,
        avgCompletionHours: avgHours,
        completionRate: total > 0 ? Math.round((done / total) * 100) : 0
      };
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
