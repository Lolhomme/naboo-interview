import { ActivityResolver } from './activity.resolver';
import { UserRole } from '../user/user.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { Activity } from './activity.schema';

describe('ActivityResolver.debug', () => {
  let resolver: ActivityResolver;

  type DebugContext = { jwtPayload?: { role?: UserRole } | null };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityResolver,
        {
          provide: ActivityService,
          useValue: {}, // debug() doesn't depend on ActivityService
        },
      ],
    }).compile();

    resolver = module.get<ActivityResolver>(ActivityResolver);
  });

  it('returns debug info for admin', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const activity: Partial<Activity> = { createdAt };
    const ctx: DebugContext = { jwtPayload: { role: UserRole.ADMIN } };

    const result = resolver.debug(activity as Activity, ctx);

    expect(result).toEqual({ createdAt });
  });

  it('returns null for non-admin', () => {
    const activity: Partial<Activity> = { createdAt: new Date() };
    const ctx: DebugContext = { jwtPayload: { role: UserRole.USER } };

    const result = resolver.debug(activity as Activity, ctx);

    expect(result).toBeNull();
  });

  it('returns null when jwtPayload is missing', () => {
    const activity: Partial<Activity> = { createdAt: new Date() };
    const ctx: DebugContext = {};

    const result = resolver.debug(activity as Activity, ctx);

    expect(result).toBeNull();
  });

  it('returns createdAt: null for admin when activity has no createdAt', () => {
    const activity: Partial<Activity> = {};
    const ctx: DebugContext = { jwtPayload: { role: UserRole.ADMIN } };

    const result = resolver.debug(activity as Activity, ctx);

    expect(result).toEqual({ createdAt: null });
  });
});
