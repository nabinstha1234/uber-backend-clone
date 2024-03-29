import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { UserService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      try {
        const decoded = await this.jwtService.verify(token);

        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          const user = await this.userService.findById(decoded['id']);
          req['user'] = user;
        }
      } catch (error) {}
    }
    next();
  }
}

// export const jwtMiddleware = (
//     req: Request,
//     res: Response,
//     next: NextFunction,
//   ) => {
//     next();
//   };
