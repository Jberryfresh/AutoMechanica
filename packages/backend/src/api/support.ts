import { Router, type Request, type Response } from 'express';

import { routeLLM } from '../llm/router.js';

const router = Router();

interface SupportMessageInput {
  message: string;
  vehicle?: Record<string, unknown>;
  partId?: string;
}

const validateBody = (body: SupportMessageInput): void => {
  if (!body.message || typeof body.message !== 'string' || !body.message.trim()) {
    const error = new Error('message is required');
    (error as Error & { status?: number }).status = 400;
    throw error;
  }
};

const handleSupportMessage = (req: Request, res: Response, next: (error?: unknown) => void): void => {
  void (async (): Promise<void> => {
    validateBody(req.body as SupportMessageInput);
    const { message, vehicle, partId } = req.body as SupportMessageInput;

    const promptPayload = {
      message,
      vehicle,
      partId,
      policy: 'Support tone and safety per SUPPORT_POLICY.md and VOICE_TONE_GUIDE.md',
    };

    const llmResult = await routeLLM({
      taskType: 'support_reply',
      payload: promptPayload,
    });

    res.json({
      reply: llmResult.output,
      confidence: llmResult.tokens?.total ? Math.min(1, 0.7 + llmResult.tokens.total / 10_000) : 0.8,
      model: llmResult.modelUsed,
      provider: llmResult.provider,
    });
  })().catch(next);
};

router.post('/support/message', handleSupportMessage);

export default router;
