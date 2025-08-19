import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PayloadDto } from './types/jwtPayload.dto';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): PayloadDto => {
    const ctx = GqlExecutionContext.create(context).getContext();
    const user = ctx?.jwtPayload as PayloadDto | null | undefined;
    if (!user) throw new UnauthorizedException();
    return user;
  },
);
