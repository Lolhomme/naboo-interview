import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  Int,
  Parent,
  ResolveField,
  ID,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from '../auth/auth.guard';
import { Activity, ActivityDebug } from './activity.schema';

import { CreateActivityInput } from './activity.inputs.dto';
import { User } from '../user/user.schema';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserRole } from '../user/user.schema';

@Resolver(() => Activity)
export class ActivityResolver {
  constructor(private readonly activityService: ActivityService) {}

  @ResolveField(() => ID)
  id(@Parent() activity: Activity): string {
    return activity._id.toString();
  }

  @ResolveField(() => User)
  async owner(@Parent() activity: Activity): Promise<User> {
    await activity.populate('owner');
    return activity.owner;
  }

  @ResolveField(() => ActivityDebug, { nullable: true })
  debug(
    @Parent() activity: Activity,
    @Context() context: { jwtPayload?: { role?: UserRole } | null },
  ): ActivityDebug | null {
    if (context?.jwtPayload?.role !== UserRole.ADMIN) return null;
    return { createdAt: activity.createdAt ?? null };
  }

  @Query(() => [Activity])
  async getActivities(): Promise<Activity[]> {
    return this.activityService.findAll();
  }

  @Query(() => [Activity])
  async getLatestActivities(): Promise<Activity[]> {
    return this.activityService.findLatest();
  }

  @Query(() => [Activity])
  @UseGuards(AuthGuard)
  async getActivitiesByUser(
    @CurrentUser() user: { id: string },
  ): Promise<Activity[]> {
    return this.activityService.findByUser(user.id);
  }

  @Query(() => [String])
  async getCities(): Promise<string[]> {
    const cities = await this.activityService.findCities();
    return cities;
  }

  @Query(() => [Activity])
  async getActivitiesByCity(
    @Args('city') city: string,
    @Args({ name: 'activity', nullable: true }) activity?: string,
    @Args({ name: 'price', nullable: true, type: () => Int }) price?: number,
  ): Promise<Activity[]> {
    return this.activityService.findByCity(city, activity, price);
  }

  @Query(() => Activity)
  async getActivity(@Args('id') id: string): Promise<Activity> {
    return this.activityService.findOne(id);
  }

  @Mutation(() => Activity)
  @UseGuards(AuthGuard)
  async createActivity(
    @CurrentUser() user: { id: string },
    @Args('createActivityInput') createActivity: CreateActivityInput,
  ): Promise<Activity> {
    return this.activityService.create(user.id, createActivity);
  }
}
