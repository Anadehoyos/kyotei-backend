import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseWebappModule } from 'src/database/database-webapp.module';
import { Session } from 'src/entities/webapp/sessions/session.entity';
import { SessionsService } from './sessions.service';

@Module({
  imports: [
    DatabaseWebappModule,
    TypeOrmModule.forFeature([Session], 'webapp'),
  ],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
