import { Request, Response } from 'express';
import { db } from '../db.js';
import { notifications } from '../../src/db/schema.js';
import { desc, eq, and } from 'drizzle-orm';

export const listNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(30);

    res.json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notificationId = parseInt(req.params.id);

    if (isNaN(notificationId)) {
      res.status(400).json({ message: 'Invalid ID' });
      return;
    }

    const updated = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))
      .returning();

    if (!updated.length) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
