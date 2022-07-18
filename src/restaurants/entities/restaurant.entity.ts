import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
@InputType({
  isAbstract: true,
})
@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  @IsNumber()
  id: number;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 20)
  name: string;

  @Field(() => Boolean, {
    nullable: true,
  })
  @Column({ default: false })
  @IsOptional()
  @IsBoolean()
  isVegan: boolean;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 200)
  address: string;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 20)
  ownerName: string;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 20)
  categoryName: string;
}
