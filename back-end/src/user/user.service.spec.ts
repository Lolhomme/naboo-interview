import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { randomUUID } from 'crypto';
import { TestModule, closeInMongodConnection } from 'src/test/test.module';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, UserModule],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('basic create / get', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });

    const fetchedUser = await userService.getById(user.id);

    expect(fetchedUser).toMatchObject({
      email,
      firstName: 'firstName',
      lastName: 'lastName',
    });
  });

  it('should add a favorite activity', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });
    const activity = await userService['activityModel'].create({
      name: 'Test Activity',
      city: 'Test City',
      description: 'desc',
      price: 10,
      owner: user._id,
    });
    const updatedUser = await userService.addFavoriteActivity(
      user.id,
      activity.id,
    );
    expect(updatedUser.favoriteActivityIds.map(String)).toContain(activity.id);
  });

  it('should get favorite activities', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });
    const activity = await userService['activityModel'].create({
      name: 'Test Activity',
      city: 'Test City',
      description: 'desc',
      price: 10,
      owner: user._id,
    });
    await userService.addFavoriteActivity(user.id, activity.id);
    const favorites = await userService.getFavoriteActivities(user.id);
    expect(favorites.length).toBe(1);
    expect(favorites[0].id.toString()).toBe(activity.id);
  });

  it('should remove a favorite activity', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });
    const activity = await userService['activityModel'].create({
      name: 'Test Activity',
      city: 'Test City',
      description: 'desc',
      price: 10,
      owner: user._id,
    });
    await userService.addFavoriteActivity(user.id, activity.id);
    const userAfterRemove = await userService.removeFavoriteActivity(
      user.id,
      activity.id,
    );
    expect(userAfterRemove.favoriteActivityIds.map(String)).not.toContain(
      activity.id,
    );
    const favoritesAfterRemove = await userService.getFavoriteActivities(
      user.id,
    );
    expect(favoritesAfterRemove.length).toBe(0);
  });

  it('should not duplicate favorite activities', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });
    const activity = await userService['activityModel'].create({
      name: 'Test Activity',
      city: 'Test City',
      description: 'desc',
      price: 10,
      owner: user._id,
    });
    await userService.addFavoriteActivity(user.id, activity.id);
    const updatedUser = await userService.addFavoriteActivity(
      user.id,
      activity.id,
    );
    expect(updatedUser.favoriteActivityIds.length).toBe(1);
  });

  it('should not throw or change favorites when removing an activity not in favorites', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });
    const activity = await userService['activityModel'].create({
      name: 'Test Activity',
      city: 'Test City',
      description: 'desc',
      price: 10,
      owner: user._id,
    });
    // Remove without adding first
    const updatedUser = await userService.removeFavoriteActivity(
      user.id,
      activity.id,
    );
    expect(updatedUser.favoriteActivityIds.map(String)).not.toContain(
      activity.id,
    );
  });

  it('should return empty array when getting favorites for user with none', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });
    const favorites = await userService.getFavoriteActivities(user.id);
    expect(favorites).toEqual([]);
  });

  it('should throw NotFoundException when adding a non-existent activity as favorite', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });
    await expect(
      userService.addFavoriteActivity(user.id, '507f1f77bcf86cd799439011'),
    ).rejects.toThrow('Activity not found');
  });

  it('should not throw when removing a non-existent activity from favorites', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });
    // Should not throw
    await expect(
      userService.removeFavoriteActivity(user.id, '507f1f77bcf86cd799439011'),
    ).resolves.toBeDefined();
  });

  it('should throw NotFoundException when adding favorite for non-existent user', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });
    const activity = await userService['activityModel'].create({
      name: 'Test Activity',
      city: 'Test City',
      description: 'desc',
      price: 10,
      owner: user._id,
    });
    await expect(
      userService.addFavoriteActivity('507f1f77bcf86cd799439011', activity.id),
    ).rejects.toThrow('User not found');
  });

  it('should throw NotFoundException when removing favorite for non-existent user', async () => {
    await expect(
      userService.removeFavoriteActivity(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      ),
    ).rejects.toThrow('User not found');
  });

  it('should throw NotFoundException when getting favorites for non-existent user', async () => {
    await expect(
      userService.getFavoriteActivities('507f1f77bcf86cd799439011'),
    ).rejects.toThrow('User not found');
  });
});
