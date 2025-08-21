import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'response-message';
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);
