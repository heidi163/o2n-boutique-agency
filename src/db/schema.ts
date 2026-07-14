import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, json, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'MEMBER']);
export const userStatusEnum = pgEnum('user_status', ['AVAILABLE', 'BUSY', 'ON_LEAVE']);
export const projectStatusEnum = pgEnum('project_status', ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']);
export const taskPriorityEnum = pgEnum('task_priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const taskStatusEnum = pgEnum('task_status', ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']);
export const notificationTypeEnum = pgEnum('notification_type', ['ASSIGNED', 'DEADLINE_SOON', 'STATUS_CHANGED', 'MENTION']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').default('MEMBER').notNull(),
  avatarUrl: text('avatar_url'),
  status: userStatusEnum('status').default('AVAILABLE').notNull(),
  jobTitle: text('job_title'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  clientId: integer('client_id').references(() => clients.id).notNull(),
  status: projectStatusEnum('status').default('PLANNING').notNull(),
  progress: integer('progress').default(0).notNull(),
  startDate: timestamp('start_date'),
  dueDate: timestamp('due_date'),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  clientId: integer('client_id').references(() => clients.id),
  assigneeId: integer('assignee_id').references(() => users.id),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  priority: taskPriorityEnum('priority').default('MEDIUM').notNull(),
  status: taskStatusEnum('status').default('TODO').notNull(),
  dueDate: timestamp('due_date'),
  estimatedHours: integer('estimated_hours'),
  actualHours: integer('actual_hours'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const subTasks = pgTable('sub_tasks', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  title: text('title').notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  action: text('action').notNull(),
  changedBy: integer('changed_by').references(() => users.id).notNull(),
  changes: json('changes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: notificationTypeEnum('type').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdClients: many(clients, { relationName: 'client_created_by' }),
  createdProjects: many(projects, { relationName: 'project_created_by' }),
  createdTasks: many(tasks, { relationName: 'task_created_by' }),
  assignedTasks: many(tasks, { relationName: 'task_assignee' }),
  activityLogs: many(activityLogs),
  notifications: many(notifications),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  creator: one(users, { fields: [clients.createdBy], references: [users.id], relationName: 'client_created_by' }),
  projects: many(projects),
  tasks: many(tasks),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
  creator: one(users, { fields: [projects.createdBy], references: [users.id], relationName: 'project_created_by' }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  client: one(clients, { fields: [tasks.clientId], references: [clients.id] }),
  assignee: one(users, { fields: [tasks.assigneeId], references: [users.id], relationName: 'task_assignee' }),
  creator: one(users, { fields: [tasks.createdBy], references: [users.id], relationName: 'task_created_by' }),
  subTasks: many(subTasks),
}));

export const subTasksRelations = relations(subTasks, ({ one }) => ({
  task: one(tasks, { fields: [subTasks.taskId], references: [tasks.id] }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  changer: one(users, { fields: [activityLogs.changedBy], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
