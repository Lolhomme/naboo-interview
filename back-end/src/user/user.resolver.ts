import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
  ID,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { User } from './user.schema';
import { UserService } from './user.service';
import { Activity } from '../activity/activity.schema';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async reorderFavoriteActivities(
    @CurrentUser() user: { id: string },
    @Args('activityIds', { type: () => [String] }) activityIds: string[],
  ): Promise<User> {
    return this.userService.reorderFavoriteActivities(user.id, activityIds);
  }

  @ResolveField(() => ID)
  id(@Parent() user: User): string {
    return user._id.toString();
  }

  @Query(() => [Activity])
  @UseGuards(AuthGuard)
  async myFavoriteActivities(
    @CurrentUser() user: { id: string },
  ): Promise<Activity[]> {
    return this.userService.getFavoriteActivities(user.id);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async addFavoriteActivity(
    @CurrentUser() user: { id: string },
    @Args('activityId') activityId: string,
  ): Promise<User> {
    return this.userService.addFavoriteActivity(user.id, activityId);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async removeFavoriteActivity(
    @CurrentUser() user: { id: string },
    @Args('activityId') activityId: string,
  ): Promise<User> {
    return this.userService.removeFavoriteActivity(user.id, activityId);
  }
}
