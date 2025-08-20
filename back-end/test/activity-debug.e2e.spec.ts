import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { BaseAppModule } from '../src/app.module';
import { SeedService } from '../src/seed/seed.service';
import { TestModule, closeInMongodConnection } from '../src/test/test.module';

describe('Activity Debug e2e', () => {
  let app: INestApplication;
  let seedService: SeedService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, BaseAppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    seedService = module.get(SeedService);
    await seedService.execute();
  });

  afterAll(async () => {
    await app.close();
    await closeInMongodConnection();
  });

  test('anonymous -> debug is null and no error', async () => {
    const activitiesRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: `query { getActivities { id name } }` })
      .expect(200);

    const anyActivityId: string = activitiesRes.body.data.getActivities[0]?.id;
    expect(anyActivityId).toEqual(expect.any(String));

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query ($id: String!) {
            getActivity(id: $id) {
              id
              name
              debug { createdAt }
            }
          }
        `,
        variables: { id: anyActivityId },
      })
      .expect(200);

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.getActivity.id).toBe(anyActivityId);
    expect(res.body.data.getActivity.debug).toBeNull();
  });

  test('non-admin user -> debug is null and no error', async () => {
    const signIn = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            login(signInInput:{ email: "user1@test.fr", password: "user1" }) { access_token }
          }
        `,
      })
      .expect(200);
    const userJwt = signIn.body.data.login.access_token as string;
    expect(userJwt).toEqual(expect.any(String));

    const activitiesRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: `query { getActivities { id } }` })
      .expect(200);
    const anyActivityId: string = activitiesRes.body.data.getActivities[0]?.id;

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('jwt', userJwt)
      .send({
        query: `
          query ($id: String!) {
            getActivity(id: $id) { id debug { createdAt } }
          }
        `,
        variables: { id: anyActivityId },
      })
      .expect(200);

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.getActivity.id).toBe(anyActivityId);
    expect(res.body.data.getActivity.debug).toBeNull();
  });

  test('admin user -> success with createdAt', async () => {
    const signIn = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            login(signInInput:{ email: "admin@test.fr", password: "admin" }) { access_token }
          }
        `,
      })
      .expect(200);
    const adminJwt = signIn.body.data.login.access_token as string;
    expect(adminJwt).toEqual(expect.any(String));

    const activitiesRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: `query { getActivities { id } }` })
      .expect(200);
    const anyActivityId: string = activitiesRes.body.data.getActivities[0]?.id;

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('jwt', adminJwt)
      .send({
        query: `
          query ($id: String!) {
            getActivity(id: $id) { id debug { createdAt } }
          }
        `,
        variables: { id: anyActivityId },
      })
      .expect(200);

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.getActivity.id).toBe(anyActivityId);
    expect(typeof res.body.data.getActivity.debug.createdAt).toBe('string');
  });
});
