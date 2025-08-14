import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityService } from './activity.service';
import { Activity, ActivitySchema } from './activity.schema';
import { ActivityResolver } from './activity.resolver';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
    ]),
    AuthModule,
    UserModule,
  ],
  exports: [ActivityService],
  providers: [ActivityService, ActivityResolver],
})
export class ActivityModule {}
