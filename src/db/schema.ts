import { relations } from 'drizzle-orm';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').default('MEMBER').notNull(), // 'ADMIN' or 'MEMBER'
  avatarUrl: text('avatar_url'),
  status: text('status').default('AVAILABLE').notNull(), // 'AVAILABLE', 'BUSY', 'ON_LEAVE'
  jobTitle: text('job_title'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const clients = sqliteTable('clients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  clientId: integer('client_id').references(() => clients.id).notNull(),
  status: text('status').default('PLANNING').notNull(), // 'PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'
  progress: integer('progress').default(0).notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  clientId: integer('client_id').references(() => clients.id),
  assigneeId: integer('assignee_id').references(() => users.id),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  priority: text('priority').default('MEDIUM').notNull(), // 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  status: text('status').default('TODO').notNull(), // 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'
  dueDate: integer('due_date', { mode: 'timestamp' }),
  estimatedHours: integer('estimated_hours'),
  actualHours: integer('actual_hours'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const subTasks = sqliteTable('sub_tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  title: text('title').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false).notNull(),
  order: integer('order').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const activityLogs = sqliteTable('activity_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  action: text('action').notNull(),
  changedBy: integer('changed_by').references(() => users.id).notNull(),
  changes: text('changes', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // 'ASSIGNED', 'DEADLINE_SOON', 'STATUS_CHANGED', 'MENTION'
  message: text('message').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
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
