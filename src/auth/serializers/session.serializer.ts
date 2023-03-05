import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: User, done: (err: Error, user: any) => void) {
    done(null, { id: user.id, email: user.email, role: user.role });
  }
  deserializeUser(payload: any, done: (err: Error, payload: any) => void) {
    done(null, payload);
  }
}
