import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutPut } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        throw new Error('User already exists');
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      await this.verification.save(
        this.verification.create({
          user,
        }),
      );
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutPut> {
    try {
      const user = await this.users.findOne({
        where: {
          email,
        },
        select: ['id', 'password'],
      });
      if (!user) {
        throw new Error('User not found');
      }

      const isPasswordCorrect = await user.checkPassword(password);

      if (!isPasswordCorrect) {
        throw new Error('Password is incorrect');
      }

      const token = await this.jwtService.sign({ id: user.id });
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
        token: null,
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const userProfile = await this.users.findOne({
        where: {
          id,
        },
      });
      if (!userProfile) {
        throw new Error('User not found');
      }
      return {
        ok: true,
        user: userProfile,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'User not found',
        user: null,
      };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne({
        where: {
          id: userId,
        },
      });
      if (email) {
        user.email = email;
        user.verified = true;
        await this.verification.save(this.verification.create({ user }));
      }
      if (password) {
        user.password = password;
      }
      this.users.save(user);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error,
      };
    }
  }

  async emailVerification(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verification.findOne({
        where: {
          code,
        },
        relations: ['user'],
      });

      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.users.delete(verification.id);
        return {
          ok: true,
        };
      }
      throw new Error();
    } catch (error) {
      return {
        ok: false,
        error: 'Code is incorrect',
      };
    }
  }
}
