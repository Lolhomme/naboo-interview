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

  describe('createUser', () => {
    it('should create a user', async () => {
      const email = randomUUID() + '@test.com';
      const user = await userService.createUser({
        email,
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
      });
      expect(user).toMatchObject({
        email,
        firstName: 'firstName',
        lastName: 'lastName',
      });
    });
  });

  describe('getById', () => {
    it('should get a user by id', async () => {
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
  });

  describe('addFavoriteActivity', () => {
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
      expect(updatedUser.favoriteActivityIds.map(String)).toContain(
        activity.id,
      );
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
        userService.addFavoriteActivity(
          '507f1f77bcf86cd799439011',
          activity.id,
        ),
      ).rejects.toThrow('User not found');
    });
  });

  describe('removeFavoriteActivity', () => {
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

    it('should throw NotFoundException when removing favorite for non-existent user', async () => {
      await expect(
        userService.removeFavoriteActivity(
          '507f1f77bcf86cd799439011',
          '507f1f77bcf86cd799439012',
        ),
      ).rejects.toThrow('User not found');
    });
  });

  describe('getFavoriteActivities', () => {
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

    it('should throw NotFoundException when getting favorites for non-existent user', async () => {
      await expect(
        userService.getFavoriteActivities('507f1f77bcf86cd799439011'),
      ).rejects.toThrow('User not found');
    });
  });

  describe('reorderFavoriteActivities', () => {
    it('should reorder favorite activities', async () => {
      const email = randomUUID() + '@test.com';
      const user = await userService.createUser({
        email,
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
      });
      const activity1 = await userService['activityModel'].create({
        name: 'Activity 1',
        city: 'City',
        description: 'desc',
        price: 10,
        owner: user._id,
      });
      const activity2 = await userService['activityModel'].create({
        name: 'Activity 2',
        city: 'City',
        description: 'desc',
        price: 20,
        owner: user._id,
      });
      const activity3 = await userService['activityModel'].create({
        name: 'Activity 3',
        city: 'City',
        description: 'desc',
        price: 30,
        owner: user._id,
      });
      await userService.addFavoriteActivity(user.id, activity1.id);
      await userService.addFavoriteActivity(user.id, activity2.id);
      await userService.addFavoriteActivity(user.id, activity3.id);
      // New order: [activity3, activity1, activity2]
      const newOrder = [activity3.id, activity1.id, activity2.id];
      const updatedUser = await userService.reorderFavoriteActivities(
        user.id,
        newOrder,
      );
      expect(updatedUser.favoriteActivityIds.map(String)).toEqual(newOrder);
      const favorites = await userService.getFavoriteActivities(user.id);
      expect(favorites.map((a) => a.id.toString())).toEqual(newOrder);
    });

    it('should throw NotFoundException when reordering for non-existent user', async () => {
      await expect(
        userService.reorderFavoriteActivities('507f1f77bcf86cd799439011', [
          '507f1f77bcf86cd799439012',
        ]),
      ).rejects.toThrow('User not found');
    });

    it('should throw if new order contains an activity not in favorites', async () => {
      const email = randomUUID() + '@test.com';
      const user = await userService.createUser({
        email,
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
      });
      const activity1 = await userService['activityModel'].create({
        name: 'Activity 1',
        city: 'City',
        description: 'desc',
        price: 10,
        owner: user._id,
      });
      await userService.addFavoriteActivity(user.id, activity1.id);
      // Try to reorder with a non-favorite activity id
      await expect(
        userService.reorderFavoriteActivities(user.id, [
          activity1.id,
          '507f1f77bcf86cd799439099',
        ]),
      ).rejects.toThrow();
    });
  });
});
