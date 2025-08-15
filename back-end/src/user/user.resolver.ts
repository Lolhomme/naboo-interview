import {
  Resolver,
  Mutation,
  Args,
  Context,
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
import { ContextWithJWTPayload } from '../auth/types/context';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @ResolveField(() => ID)
  id(@Parent() user: User): string {
    return user._id.toString();
  }

  @Query(() => [Activity])
  @UseGuards(AuthGuard)
  async myFavoriteActivities(
    @Context() context: ContextWithJWTPayload,
  ): Promise<Activity[]> {
    return this.userService.getFavoriteActivities(context.jwtPayload.id);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async addFavoriteActivity(
    @Context() context: ContextWithJWTPayload,
    @Args('activityId') activityId: string,
  ): Promise<User> {
    return this.userService.addFavoriteActivity(
      context.jwtPayload.id,
      activityId,
    );
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async removeFavoriteActivity(
    @Context() context: ContextWithJWTPayload,
    @Args('activityId') activityId: string,
  ): Promise<User> {
    return this.userService.removeFavoriteActivity(
      context.jwtPayload.id,
      activityId,
    );
  }
}
