export interface PaginatedResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface StandardResponse<T = any> {
  message: string[];
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export class StandardErrorResponse {
  message: string[];
  error?: string;
  details?: any;
}
