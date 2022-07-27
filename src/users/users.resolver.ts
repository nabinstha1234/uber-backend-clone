import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuards } from 'src/auth/auth.guard';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { LoginInput, LoginOutPut } from './dtos/login.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly userService: UserService) {}

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

  @Query(() => User)
  @UseGuards(AuthGuards)
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @UseGuards(AuthGuards)
  @Query(() => UserProfileOutput)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const userProfile = await this.userService.findById(
        userProfileInput.userId,
      );
      if (!userProfile) {
        throw new Error('User not found');
      }
      return {
        ok: true,
        user: userProfile,
      };
    } catch (error) {
      return {
        error: 'user not found',
        ok: false,
        user: null,
      };
    }
  }

  @UseGuards(AuthGuards)
  @Mutation(() => EditProfileOutput)
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      await this.userService.editProfile(authUser.id, editProfileInput);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
