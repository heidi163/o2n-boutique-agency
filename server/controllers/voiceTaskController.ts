import { Request, Response, NextFunction } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { TaskService } from '../services/taskService.js';
import { ProjectService } from '../services/projectService.js';
import { apiResponse, ApiError } from '../middlewares/errorHandler.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const taskService = new TaskService();
const projectService = new ProjectService();

export const createVoiceTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) throw new ApiError(400, 'Audio data is required', 'MISSING_AUDIO');

    // Fetch user's projects to match context
    const projects = await projectService.listProjects({}, 1, 100);
    
    let projectListContext = 'No existing projects. The system will create a default project.';
    if (projects.length > 0) {
      projectListContext = projects.map(p => `${p.id}: ${p.name}`).join('\n');
    }

    const prompt = `You are an AI assistant that parses voice notes into structured tasks.
Listen to the audio and extract the following:
- title: A concise title for the task
- description: Any additional details mentioned
- priority: One of LOW, MEDIUM, HIGH, URGENT (infer from tone or words like "asap", "urgent". Default to MEDIUM)
- projectId: Match the task to the most relevant project ID from this list:
${projectListContext}
If unsure or if the list is empty, return -1.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: audioBase64
              }
            },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
            projectId: { type: Type.INTEGER }
          },
          required: ['title', 'description', 'priority', 'projectId']
        }
      }
    });

    const extracted = JSON.parse(response.text || '{}');
    
    let targetProjectId = extracted.projectId;

    // Handle invalid project ID
    if (targetProjectId === -1 || !projects.find(p => p.id === targetProjectId)) {
      if (projects.length > 0) {
        targetProjectId = projects[0].id;
      } else {
        // Create a default project
        const newProj = await projectService.createProject(req.user!.id, {
          name: 'General Tasks',
          description: 'Auto-created project for general voice tasks',
          status: 'ACTIVE'
        });
        targetProjectId = newProj.id;
      }
    }

    const task = await taskService.createTask(req.user!.id, {
      title: extracted.title || 'Voice Task',
      description: extracted.description || '',
      priority: extracted.priority || 'MEDIUM',
      projectId: targetProjectId,
      status: 'TODO'
    });

    res.status(201).json(apiResponse(task));
  } catch (err) { next(err); }
};
