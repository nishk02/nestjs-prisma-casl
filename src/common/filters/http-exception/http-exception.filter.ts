import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { StandardErrorResponse } from 'src/common/interface/http/http.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const exceptionResponse: any = exception.getResponse();
    const status = exception.getStatus();

    const errorResponse: StandardErrorResponse = {
      message: [],
    };

    if (typeof exceptionResponse === 'string') {
      errorResponse.message.push(exceptionResponse);
    } else if (typeof exceptionResponse === 'object') {
      // Handle cases where NestJS validation pipe returns an array of messages
      if (Array.isArray(exceptionResponse['message'])) {
        errorResponse.message = exceptionResponse['message'];
      } else if (typeof exceptionResponse['message'] === 'string') {
        errorResponse.message.push(exceptionResponse['message']);
      }

      // Add a general error field if available or construct from message
      if (exceptionResponse['error']) {
        errorResponse.error = exceptionResponse['error'];
      } else if (errorResponse.message.length > 0) {
        errorResponse.error = errorResponse.message[0]; // Take the first message as a general error
      }

      // Add details if available (e.g., validation errors)
      if (exceptionResponse['details']) {
        errorResponse.details = exceptionResponse['details'];
      }
    }

    // Fallback if no specific message is found
    if (errorResponse.message.length === 0) {
      errorResponse.message.push('An error occurred');
    }

    ctx
      .getResponse<Response>()
      .status(status)
      .json({
        ...errorResponse,
      });
  }
}
