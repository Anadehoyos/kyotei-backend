import { Module } from '@nestjs/common';
import { AlertsController } from './controller/alerts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from 'src/entities/api/contracts/contract.entity';
import { AlertsService } from './service/alerts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contract], 'api')],
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}
