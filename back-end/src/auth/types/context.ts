import { PayloadDto } from './jwtPayload.dto';

export interface ContextWithJWTPayload {
  // When a request is anonymous or the token is invalid/absent, this will be null
  jwtPayload: PayloadDto | null;
  // Add other properties you expect in the context here
}
