import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
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
      await this.users.save(this.users.create({ email, password, role }));
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
    }
    if (password) {
      user.password = password;
    }
    return this.users.save(user);
  }
}
