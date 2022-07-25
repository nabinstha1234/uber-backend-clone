import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from './jwt.constants';
import { JwtModuleOptions } from './jwt.interfaces';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}

  async sign(payload: object): Promise<string> {
    return await jwt.sign(payload, this.options.privateKey);
  }

  async verify(token: string): Promise<string | jwt.JwtPayload> {
    return await jwt.verify(token, this.options.privateKey);
  }
}
