import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { generateQueryPlan } from '../services/queryPlanner';
import { executeQueryPlan } from '../services/queryExecutor';

export const chatRouter = Router();

const AskRequestSchema = z.object({
  question: z.string().min(2, 'Question is too short').max(500, 'Question is too long'),
});

chatRouter.post('/ask', async (req: Request, res: Response) => {
  try {
    const parsed = AskRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const plan = await generateQueryPlan(parsed.data.question);
    const result = executeQueryPlan(parsed.data.question, plan);

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    res.status(422).json({ error: message });
  }
});