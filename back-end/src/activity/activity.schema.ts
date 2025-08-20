import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../user/user.schema';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class Activity extends Document {
  @Field(() => ID)
  id!: string;

  @Field()
  @Prop({ required: true })
  name!: string;

  @Field()
  @Prop({ required: true })
  city!: string;

  @Field()
  @Prop({ required: true })
  description!: string;

  @Field()
  @Prop({ required: true })
  price!: number;

  @Field(() => User)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  owner!: User;

  createdAt?: Date;

  // Admin-only debug view (resolved in resolver)
  @Field(() => ActivityDebug, { nullable: true })
  debug?: ActivityDebug | null;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

@ObjectType()
export class ActivityDebug {
  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;
}
