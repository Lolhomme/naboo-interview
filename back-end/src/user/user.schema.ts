import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

@ObjectType()
@Schema({ timestamps: true })
export class User extends Document {
  @Field(() => ID)
  id!: string;

  @Field(() => UserRole)
  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Field()
  @Prop({ required: true })
  firstName!: string;

  @Field()
  @Prop({ required: true })
  lastName!: string;

  @Field()
  @Prop({ required: true, unique: true })
  email!: string;

  @Field()
  @Prop({ required: true })
  password!: string;

  @Prop()
  token?: string;

  @Field(() => [ID])
  @Prop({ type: [Types.ObjectId], ref: 'Activity', default: [] })
  favoriteActivityIds!: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
