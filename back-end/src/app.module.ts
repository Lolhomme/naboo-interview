import { Module, InternalServerErrorException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityModule } from './activity/activity.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { SeedModule } from './seed/seed.module';
import { SeedService } from './seed/seed.service';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { PayloadDto } from './auth/types/jwtPayload.dto';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [JwtModule],
      inject: [JwtService, ConfigService],
      useFactory: async (
        jwtService: JwtService,
        configService: ConfigService,
      ) => {
        const secret = configService.get<string>('JWT_SECRET');
        return {
          autoSchemaFile: 'schema.gql',
          sortSchema: true,
          playground: true,
          buildSchemaOptions: { numberScalarMode: 'integer' },
          context: async ({ req, res }: { req: Request; res: Response }) => {
            const token =
              req.headers.jwt ?? (req.cookies && req.cookies['jwt']);

            let jwtPayload: PayloadDto | null = null;
            if (token) {
              try {
                jwtPayload = (await jwtService.verifyAsync(token, {
                  secret,
                })) as PayloadDto;
              } catch (error) {
                jwtPayload = null;
              }
            }

            return {
              jwtPayload,
              req,
              res,
            };
          },
        };
      },
    }),
    AuthModule,
    UserModule,
    MeModule,
    ActivityModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class BaseAppModule {}

@Module({
  imports: [
    BaseAppModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        if (!uri) {
          throw new InternalServerErrorException(
            'MONGO_URI is not defined in the environment variables',
          );
        }
        return { uri };
      },
    }),
  ],
})
export class AppModule {}
