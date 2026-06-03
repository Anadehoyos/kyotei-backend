import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'src/entities/webapp/sessions/session.entity';
import { User } from 'src/entities/webapp/users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session, 'webapp')
    private readonly sessionRepo: Repository<Session>,
  ) {}

  create(userId: User, token: string, expiresAt: Date): Promise<Session> {
    const session = new Session();
    session.token = token;
    session.expires_at = expiresAt;
    session.user = userId;
    return this.sessionRepo.save(session);
  }

  findByToken(token: string): Promise<Session | null> {
    return this.sessionRepo.findOne({
      where: { token },
      relations: ['user', 'user.role'],
    });
  }

  deleteByToken(token: string) {
    return this.sessionRepo.delete({ token });
  }
}
