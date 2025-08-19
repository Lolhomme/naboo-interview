import { Query, Resolver } from '@nestjs/graphql';
import { UserService } from '../../user/user.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { User } from '../../user/user.schema';
import { CurrentUser } from '../../auth/current-user.decorator';

@Resolver('Me')
export class MeResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: { id: string }): Promise<User> {
    return this.userService.getById(user.id);
  }
}
