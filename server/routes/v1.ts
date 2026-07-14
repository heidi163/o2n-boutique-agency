import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/auth.js';
import { createClient, getClient, updateClient, deleteClient, listClients } from '../controllers/clientController.js';
import { createProject, getProject, updateProject, deleteProject, listProjects } from '../controllers/projectController.js';
import { createTask, getTask, updateTask, deleteTask, listTasks } from '../controllers/taskController.js';
import { createVoiceTask } from '../controllers/voiceTaskController.js';
import { createSubTask, updateSubTask, deleteSubTask } from '../controllers/subTaskController.js';
import { listUsers } from '../controllers/userController.js';
import { listActivityLogs } from '../controllers/activityLogController.js';
import { listNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { getPerformance } from '../controllers/performanceController.js';

const router = Router();

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/me', requireAuth, getMe);

// Users
router.get('/users', requireAuth, listUsers);

// Clients
router.post('/clients', requireAuth, createClient);
router.get('/clients', requireAuth, listClients);
router.get('/clients/:id', requireAuth, getClient);
router.put('/clients/:id', requireAuth, updateClient);
router.delete('/clients/:id', requireAuth, deleteClient);

// Projects
router.post('/projects', requireAuth, createProject);
router.get('/projects', requireAuth, listProjects);
router.get('/projects/:id', requireAuth, getProject);
router.put('/projects/:id', requireAuth, updateProject);
router.delete('/projects/:id', requireAuth, deleteProject);

// Tasks
router.post('/tasks', requireAuth, createTask);
router.post('/tasks/voice', requireAuth, createVoiceTask);
router.get('/tasks', requireAuth, listTasks);
router.get('/tasks/:id', requireAuth, getTask);
router.put('/tasks/:id', requireAuth, updateTask);
router.delete('/tasks/:id', requireAuth, deleteTask);

// SubTasks
router.post('/subtasks', requireAuth, createSubTask);
router.put('/subtasks/:id', requireAuth, updateSubTask);
router.delete('/subtasks/:id', requireAuth, deleteSubTask);

// Activity Logs
router.get('/activity-logs', requireAuth, listActivityLogs);

// Notifications
router.get('/notifications', requireAuth, listNotifications);
router.put('/notifications/read-all', requireAuth, markAllAsRead);
router.put('/notifications/:id/read', requireAuth, markAsRead);

// Performance
router.get('/performance', requireAuth, getPerformance);

export default router;
