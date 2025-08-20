import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { BaseAppModule } from '../src/app.module';
import { SeedService } from '../src/seed/seed.service';
import { TestModule, closeInMongodConnection } from '../src/test/test.module';

describe('Favorites e2e', () => {
  let app: INestApplication;
  let seedService: SeedService;
  let userJwt: string;
  let activityIds: string[] = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, BaseAppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    // Seed data
    seedService = module.get(SeedService);
    await seedService.execute();

    // Sign in as regular user
    const signIn = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation { login(signInInput:{ email: "user1@test.fr", password: "user1" }) { access_token } }
        `,
      })
      .expect(200);
    userJwt = signIn.body.data.login.access_token as string;

    // Fetch some activities to use as favorites
    const activitiesRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: `query { getActivities { id } }` })
      .expect(200);
    activityIds = activitiesRes.body.data.getActivities.map((a: any) => a.id);
  });

  afterAll(async () => {
    await app.close();
    await closeInMongodConnection();
  });

  test('initial favorites are empty', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('jwt', userJwt)
      .send({ query: `query { myFavoriteActivities { id } }` })
      .expect(200);

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.myFavoriteActivities).toEqual([]);
  });

  test('addFavoriteActivity adds one, and is idempotent', async () => {
    const first = activityIds[0];

    // Add once
    const add1 = await request(app.getHttpServer())
      .post('/graphql')
      .set('jwt', userJwt)
      .send({
        query: `mutation ($id: String!) { addFavoriteActivity(activityId: $id) { favoriteActivityIds } }`,
        variables: { id: first },
      })
      .expect(200);
    expect(add1.body.errors).toBeUndefined();
    expect(add1.body.data.addFavoriteActivity.favoriteActivityIds).toContain(
      first,
    );

    // Add again (should not duplicate)
    const add2 = await request(app.getHttpServer())
      .post('/graphql')
      .set('jwt', userJwt)
      .send({
        query: `mutation ($id: String!) { addFavoriteActivity(activityId: $id) { favoriteActivityIds } }`,
        variables: { id: first },
      })
      .expect(200);
    expect(add2.body.errors).toBeUndefined();

    // Verify via myFavoriteActivities
    const favs = await request(app.getHttpServer())
      .post('/graphql')
      .set('jwt', userJwt)
      .send({ query: `query { myFavoriteActivities { id } }` })
      .expect(200);

    const ids = favs.body.data.myFavoriteActivities.map((a: any) => a.id);
    expect(ids).toEqual([first]);
  });

  test('add another favorite, reorder, then remove one', async () => {
    const [first, second, third] = activityIds.slice(0, 3);
    expect(first && second).toBeTruthy();

    // Add second and third
    const addSecond = await request(app.getHttpServer())
      .post('/graphql')
      .set('jwt', userJwt)
      .send({
        query: `mutation ($id: String!) { addFavoriteActivity(activityId: $id) { favoriteActivityIds } }`,
        variables: { id: second },
      })
      .expect(200);
    expect(addSecond.body.errors).toBeUndefined();

    const addThird = await request(app.getHttpServer())
      .post('/graphql')
      .set('jwt', userJwt)
      .send({
        query: `mutation ($id: String!) { addFavoriteActivity(activityId: $id) { favoriteActivityIds } }`,
        variables: { id: third },
      })
      .expect(200);
    expect(addThird.body.errors).toBeUndefined();

    // Reorder to [third, first, second]
    const newOrder = [third, first, second];
    const reorder = await request(app.getHttpServer())
      .post('/graphql')
      .set('jwt', userJwt)
      .send({
        query: `mutation ($ids: [String!]!) { reorderFavoriteActivities(activityIds: $ids) { favoriteActivityIds } }`,
        variables: { ids: newOrder },
      })
      .expect(200);
    expect(reorder.body.errors).toBeUndefined();
    expect(
      reorder.body.data.reorderFavoriteActivities.favoriteActivityIds,
    ).toEqual(newOrder);

    // Verify order via myFavoriteActivities
    const favsAfterReorder = await request(app.getHttpServer())
      .post('/graphql')
      .set('jwt', userJwt)
      .send({ query: `query { myFavoriteActivities { id } }` })
      .expect(200);
    const orderIds = favsAfterReorder.body.data.myFavoriteActivities.map(
      (a: any) => a.id,
    );
    expect(orderIds).toEqual(newOrder);

    // Remove one (first in order = third)
    const remove = await request(app.getHttpServer())
      .post('/graphql')
      .set('jwt', userJwt)
      .send({
        query: `mutation ($id: String!) { removeFavoriteActivity(activityId: $id) { favoriteActivityIds } }`,
        variables: { id: third },
      })
      .expect(200);
    expect(remove.body.errors).toBeUndefined();

    // Verify remaining via myFavoriteActivities
    const favsAfterRemove = await request(app.getHttpServer())
      .post('/graphql')
      .set('jwt', userJwt)
      .send({ query: `query { myFavoriteActivities { id } }` })
      .expect(200);
    const remainingIds = favsAfterRemove.body.data.myFavoriteActivities.map(
      (a: any) => a.id,
    );
    expect(remainingIds).toEqual([first, second]);
  });

  test('adding non-existent activity returns error and does not change list', async () => {
    const before = await request(app.getHttpServer())
      .post('/graphql')
      .set('jwt', userJwt)
      .send({ query: `query { myFavoriteActivities { id } }` })
      .expect(200);
    const beforeIds = before.body.data.myFavoriteActivities.map(
      (a: any) => a.id,
    );

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('jwt', userJwt)
      .send({
        query: `mutation ($id: String!) { addFavoriteActivity(activityId: $id) { id } }`,
        variables: { id: '507f1f77bcf86cd799439011' },
      })
      .expect(200);
    expect(res.body.errors?.[0]?.message).toMatch(/not found/i);

    const after = await request(app.getHttpServer())
      .post('/graphql')
      .set('jwt', userJwt)
      .send({ query: `query { myFavoriteActivities { id } }` })
      .expect(200);
    const afterIds = after.body.data.myFavoriteActivities.map((a: any) => a.id);
    expect(afterIds).toEqual(beforeIds);
  });
});
