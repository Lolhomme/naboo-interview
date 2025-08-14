import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

@InputType()
export class SignInInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsNotEmpty()
  password!: string;
}

@InputType()
export class SignUpInput extends SignInInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @Field()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
  })
  password!: string;
}
