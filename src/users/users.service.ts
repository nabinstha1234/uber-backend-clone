import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';

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
  }: CreateAccountInput): Promise<[boolean, string?]> {
    try {
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        return [false, 'There is a user with that email already'];
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      await this.verification.save(
        this.verification.create({
          user,
        }),
      );
      return [true];
    } catch (e) {
      return [false, "Couldn't create account"];
    }
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<[boolean, string?, string?]> {
    try {
      const user = await this.users.findOne({
        where: {
          email,
        },
        select: ['id', 'password'],
      });
      if (!user) {
        return [false, 'User not found', null];
      }

      const isPasswordCorrect = await user.checkPassword(password);

      if (!isPasswordCorrect) {
        return [false, 'Password is incorrect', null];
      }

      const token = await this.jwtService.sign({ id: user.id });
      return [true, null, token];
    } catch (error) {
      return [false, "Couldn't login"];
    }
  }

  findById(id: number): Promise<User> {
    return this.users.findOne({
      where: {
        id,
      },
    });
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<User> {
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
    return this.users.save(user);
  }

  async emailVerification(code: string): Promise<boolean> {
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
        return true;
      }
      throw new Error();
    } catch (error) {
      return false;
    }
  }
}
