export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly fields?: Record<string, string>;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', fields?: Record<string, string>) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR', fields);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden action', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict occurred', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

