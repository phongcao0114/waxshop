import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppError {
  message: string;
  type: 'error' | 'warning' | 'info';
  code?: string;
  details?: any;
  timestamp: Date;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private errorSubject = new BehaviorSubject<AppError | null>(null);
  private errorsSubject = new BehaviorSubject<AppError[]>([]);
  
  public currentError$ = this.errorSubject.asObservable();
  public allErrors$ = this.errorsSubject.asObservable();

  constructor() {}

  showError(message: string, code?: string, details?: any): void {
    const error: AppError = {
      message,
      type: 'error',
      code,
      details,
      timestamp: new Date(),
      dismissible: true
    };
    
    this.errorSubject.next(error);
    this.addToErrorHistory(error);
    console.error('ErrorHandler:', error);
  }

  showWarning(message: string, code?: string): void {
    const warning: AppError = {
      message,
      type: 'warning',
      code,
      timestamp: new Date(),
      dismissible: true
    };
    
    this.errorSubject.next(warning);
    this.addToErrorHistory(warning);
    console.warn('ErrorHandler:', warning);
  }

  showInfo(message: string): void {
    const info: AppError = {
      message,
      type: 'info',
      timestamp: new Date(),
      dismissible: true
    };
    
    this.errorSubject.next(info);
    this.addToErrorHistory(info);
    console.log('ErrorHandler:', info);
  }

  clearCurrentError(): void {
    this.errorSubject.next(null);
  }

  clearAllErrors(): void {
    this.errorsSubject.next([]);
  }

  private addToErrorHistory(error: AppError): void {
    const currentErrors = this.errorsSubject.value;
    const newErrors = [...currentErrors, error];
    
    // Keep only last 10 errors
    if (newErrors.length > 10) {
      newErrors.splice(0, newErrors.length - 10);
    }
    
    this.errorsSubject.next(newErrors);
  }

  // Handle HTTP errors
  handleHttpError(error: any, context?: string): void {
    let message = 'An unexpected error occurred.';
    let code = 'UNKNOWN_ERROR';

    if (error.status === 0) {
      message = 'Network error. Please check your connection.';
      code = 'NETWORK_ERROR';
    } else if (error.status === 400) {
      message = error.error?.message || 'Invalid request.';
      code = 'BAD_REQUEST';
    } else if (error.status === 401) {
      message = 'Authentication failed. Please log in again.';
      code = 'UNAUTHORIZED';
    } else if (error.status === 403) {
      message = 'You do not have permission to perform this action.';
      code = 'FORBIDDEN';
    } else if (error.status === 404) {
      message = 'The requested resource was not found.';
      code = 'NOT_FOUND';
    } else if (error.status >= 500) {
      message = 'Server error. Please try again later.';
      code = 'SERVER_ERROR';
    } else if (error.message) {
      message = error.message;
      code = 'CUSTOM_ERROR';
    }

    if (context) {
      message = `${context}: ${message}`;
    }

    this.showError(message, code, error);
  }

  // Handle authentication errors
  handleAuthError(error: any): void {
    this.handleHttpError(error, 'Authentication');
  }

  // Handle API errors
  handleApiError(error: any, endpoint?: string): void {
    const context = endpoint ? `API Error (${endpoint})` : 'API Error';
    this.handleHttpError(error, context);
  }

  // Get formatted error message for display
  getFormattedMessage(error: AppError): string {
    if (error.code && error.code !== 'UNKNOWN_ERROR') {
      return `${error.message} (${error.code})`;
    }
    return error.message;
  }

  // Check if error is dismissible
  isDismissible(error: AppError): boolean {
    return error.dismissible !== false;
  }

  // Get error count
  getErrorCount(): number {
    return this.errorsSubject.value.length;
  }

  // Get recent errors (last 5)
  getRecentErrors(): AppError[] {
    const errors = this.errorsSubject.value;
    return errors.slice(-5);
  }
} 