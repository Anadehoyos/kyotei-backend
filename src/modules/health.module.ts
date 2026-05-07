import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { AuthModule } from './auth/auth.module';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
  imports: [AuthModule],
})
export class HealthModule {}
