import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { AuthModule } from './auth/auth.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { ContractsModule } from './contracts/contracts.module';
import { AlertsModule } from './alerts/alerts.module';
import { MailModule } from './mail/mail.module';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
  imports: [
    AuthModule,
    SuppliersModule,
    CatalogsModule,
    ContractsModule,
    AlertsModule,
    MailModule,
  ],
})
export class HealthModule {}
