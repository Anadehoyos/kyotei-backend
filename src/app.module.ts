import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { HealthModule } from './modules/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContractsModule } from './modules/contracts/contracts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    ContractsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
