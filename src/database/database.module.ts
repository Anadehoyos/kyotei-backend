import { Module } from '@nestjs/common';
import { DatabaseApiModule } from './database-api.module';
import { DatabaseWebappModule } from './database-webapp.module';

@Module({
  imports: [DatabaseApiModule, DatabaseWebappModule],
})
export class DatabaseModule {}
