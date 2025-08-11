// Express.js type extensions
declare global {
  namespace Express {
    interface Request {
      id?: string;
      startTime?: number;
      context?: {
        requestId: string;
        userAgent?: string;
        ip?: string;
        userId?: string;
      };
    }
  }
}

export {};