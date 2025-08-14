import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  Min,
  MaxLength,
  IsString,
  Matches,
} from 'class-validator';

@InputType()
export class CreateActivityInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Activity name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z0-9\s\-_']+$/, {
    message: 'Activity name contains invalid characters',
  })
  name!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'City name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s\-']+$/, {
    message: 'City name contains invalid characters',
  })
  city!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description!: string;

  @Field(() => Int)
  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(1, { message: 'Price must be at least 1' })
  price!: number;
}
