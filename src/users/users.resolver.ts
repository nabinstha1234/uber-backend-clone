import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { AuthGuards } from 'src/auth/auth.guard';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutPut } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => Boolean)
  hi() {
    return true;
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      const [ok, error] = await this.userService.createAccount(
        createAccountInput,
      );
      return { ok, error };
    } catch (error) {
      return {
        error,
        ok: false,
      };
    }
  }

  @Mutation(() => LoginOutPut)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutPut> {
    try {
      const [ok, error, token] = await this.userService.login(loginInput);
      return { ok, error, token };
    } catch (e) {
      return {
        error: e,
        ok: false,
        token: null,
      };
    }
  }

  @Query(() => Boolean)
  @UseGuards(AuthGuards)
  me() {
    // console.log(context);
    return true;
  }
}
