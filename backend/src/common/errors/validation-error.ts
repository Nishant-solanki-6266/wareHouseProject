import { AppError } from './app-error.js';

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors: unknown[] = []) {
    super(message, 400, true, errors);
  }
}
