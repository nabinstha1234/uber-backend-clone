import { Field, ArgsType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

@ArgsType()
export class CreateRestaurantDto {
  @Field(() => String)
  @IsString()
  @Length(3, 255)
  name: string;
  @Field(() => Boolean)
  @IsBoolean()
  isVegan: boolean;
  @Field(() => String)
  @IsString()
  address: string;
  @Field(() => String)
  @IsString()
  @Length(3, 255)
  ownerName: string;
}
