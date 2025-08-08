import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { aiDmRouter } from './routes/ai-dm';
import { campaignRouter } from './routes/campaigns';
import { characterRouter } from './routes/characters';
import { sessionRouter } from './routes/sessions';
import { errorHandler } from './middleware/error-handler';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/ai-dm', aiDmRouter);
app.use('/api/campaigns', campaignRouter);
app.use('/api/characters', characterRouter);
app.use('/api/sessions', sessionRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const server = app.listen(port, () => {
  logger.info(`🎲 Dungeons Terminal AI DM running on port ${port}`);
});

export { app, server };