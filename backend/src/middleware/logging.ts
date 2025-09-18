import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.colorize({ all: true })
  ),
  defaultMeta: { service: 'career-advisor-api' },
  transports: [
    // Write to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write to file
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: winston.format.json()
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: winston.format.json()
    })
  ],
});

// Request ID generator
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Add request ID to request object
  (req as any).requestId = requestId;

  // Log incoming request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(logLevel, 'Request completed', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length') || '0',
      timestamp: new Date().toISOString()
    });
  });

  next();
};

// Error logging middleware
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId || 'unknown';
  
  logger.error('Request error', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code
    },
    timestamp: new Date().toISOString()
  });

  next(err);
};

// AI operation logging
export const logAIOperation = (operation: string, input: any, output?: any, duration?: number, error?: any) => {
  const logData: any = {
    operation,
    input: {
      type: typeof input,
      size: JSON.stringify(input).length,
      skills: input.skills?.length || 0
    },
    timestamp: new Date().toISOString()
  };

  if (output) {
    logData.output = {
      success: true,
      recommendations: output.recommendations?.topMatches?.length || 0,
      skillGaps: output.skillGapAnalysis?.length || 0
    };
  }

  if (duration) {
    logData.performance = {
      duration: `${duration}ms`,
      classification: duration < 1000 ? 'fast' : duration < 3000 ? 'normal' : 'slow'
    };
  }

  if (error) {
    logger.error('AI operation failed', {
      ...logData,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  } else {
    logger.info('AI operation completed', logData);
  }
};

// Performance monitoring
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    const requestId = (req as any).requestId || 'unknown';

    logger.info('Performance metrics', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      performance: {
        duration: `${duration.toFixed(2)}ms`,
        memoryUsage: {
          heapUsed: `${Math.round((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(endMemory.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(endMemory.external / 1024 / 1024)}MB`
        },
        cpuUsage: process.cpuUsage()
      },
      timestamp: new Date().toISOString()
    });
  });

  next();
};

// Health metrics logging
export const logHealthMetrics = () => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();

  logger.info('Health metrics', {
    system: {
      uptime: `${Math.floor(uptime)}s`,
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
      },
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform
    },
    timestamp: new Date().toISOString()
  });
};

// Security event logging
export const logSecurityEvent = (event: string, req: Request, details?: any) => {
  logger.warn('Security event', {
    event,
    requestId: (req as any).requestId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method,
    details,
    timestamp: new Date().toISOString()
  });
};

export default logger;