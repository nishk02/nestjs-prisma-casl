import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { StandardResponse } from 'src/common/interface/http/http.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    const message = this.reflector.get<string[]>(
      'response-message',
      context.getHandler(),
    );
    return next.handle().pipe(
      map((response) => {
        // If the response contains pagination metadata (e.g., from findAll operations)
        if (response && response.meta && response.data) {
          return {
            message,
            data: response.data,
            meta: response.meta,
          };
        }

        // For non-paginated responses, simply return the data
        return {
          message,
          data: response,
        };
      }),
    );
  }
}
