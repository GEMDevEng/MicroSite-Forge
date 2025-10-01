/**
 * Centralized error handling utilities
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { logger } from './logger'

export interface ErrorResponse {
  error: string
  message?: string
  details?: Record<string, unknown>
  code?: string
  timestamp: string
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: Record<string, unknown>) {
    super(`${service} service error: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', details)
    this.name = 'ExternalServiceError'
  }
}

/**
 * Standardized API error handler for Next.js API routes
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  const timestamp = new Date().toISOString()

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errorResponse: ErrorResponse = {
      error: 'Validation error',
      message: 'Invalid request data',
      details: {
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }))
      },
      code: 'VALIDATION_ERROR',
      timestamp,
    }

    logger.warn('Validation error', { context, errors: error.errors })
    return NextResponse.json(errorResponse, { status: 400 })
  }

  // Handle custom app errors
  if (error instanceof AppError) {
    const errorResponse: ErrorResponse = {
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp,
    }

    if (error.statusCode >= 500) {
      logger.error('Application error', error, { context })
    } else {
      logger.warn('Client error', { context, error: error.message, code: error.code })
    }

    return NextResponse.json(errorResponse, { status: error.statusCode })
  }

  // Handle standard errors
  if (error instanceof Error) {
    const errorResponse: ErrorResponse = {
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: 'INTERNAL_ERROR',
      timestamp,
    }

    logger.error('Unexpected error', error, { context })
    return NextResponse.json(errorResponse, { status: 500 })
  }

  // Handle unknown errors
  const errorResponse: ErrorResponse = {
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    timestamp,
  }

  logger.error('Unknown error', new Error('Unknown error type'), { context, error })
  return NextResponse.json(errorResponse, { status: 500 })
}

/**
 * Async error wrapper for API routes
 */
export function withErrorHandler<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error, context)
    }
  }
}

/**
 * Client-side error handler
 */
export function handleClientError(error: unknown, context?: string): string {
  logger.error('Client error', error instanceof Error ? error : new Error('Unknown error'), { context })

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return 'An unexpected error occurred'
}

/**
 * Error boundary helper for React components
 */
export class ErrorBoundaryError extends Error {
  constructor(
    message: string,
    public componentStack?: string,
    public errorBoundary?: string
  ) {
    super(message)
    this.name = 'ErrorBoundaryError'
  }
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    // Don't expose internal error details to users
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Network error. Please check your connection and try again.'
    }
    
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.'
    }

    return 'Something went wrong. Please try again.'
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  context?: string
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      if (attempt === maxRetries) {
        logger.error(`Operation failed after ${maxRetries + 1} attempts`, lastError, { context })
        throw lastError
      }

      const delay = baseDelay * Math.pow(2, attempt)
      logger.warn(`Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`, {
        context,
        error: lastError.message,
      })

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T,
  context?: string
): Promise<T | undefined> {
  try {
    return await operation()
  } catch (error) {
    logger.error('Safe async operation failed', error instanceof Error ? error : new Error('Unknown error'), { context })
    return fallback
  }
}
