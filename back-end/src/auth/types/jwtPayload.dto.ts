import { UserRole } from 'src/user/user.schema';

export type PayloadDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};
