import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { map, type Observable } from 'rxjs';

export interface DataResponse<T> {
  data: T;
}

@Injectable()
export class DataResponseInterceptor<T>
  implements NestInterceptor<T, T | DataResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<T | DataResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.path === '/health' || request.path.startsWith('/api/docs')) {
      return next.handle();
    }

    return next.handle().pipe(map((payload) => ({ data: payload })));
  }
}
