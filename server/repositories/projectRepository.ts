import { db } from '../db.js';
import { projects } from '../../src/db/schema.js';
import { eq, desc, ilike, and, or } from 'drizzle-orm';

export class ProjectRepository {
  async createProject(data: typeof projects.$inferInsert) {
    const [project] = await db.insert(projects).values(data).returning();
    return project;
  }

  async getProjectById(id: number) {
    return db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        client: true,
      }
    });
  }

  async updateProject(id: number, data: Partial<typeof projects.$inferInsert>) {
    const [project] = await db.update(projects).set(data).where(eq(projects.id, id)).returning();
    return project;
  }

  async deleteProject(id: number) {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async listProjects(filters: { search?: string, status?: string, clientId?: number }, limit = 50, offset = 0) {
    const conditions = [];
    if (filters.status) conditions.push(eq(projects.status, filters.status as any));
    if (filters.clientId) conditions.push(eq(projects.clientId, filters.clientId));
    if (filters.search) conditions.push(ilike(projects.name, `%${filters.search}%`));
    
    return db.query.projects.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(projects.createdAt)],
      limit,
      offset,
      with: {
        client: true,
      }
    });
  }
}
