import { Controller, Get, UseGuards } from '@nestjs/common';
import { AlertsService } from '../service/alerts.service';
import { RequirePermissions } from 'src/modules/auth/decorators/permission.decorator';
import { User } from 'src/modules/auth/decorators/user.decorator';
import type { JwtPayload } from 'src/common/interface/jwt-payload.interface';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/modules/auth/guards/permission.guard';

@Controller('alerts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('ver_alertas')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  async getAllExpirations(@User() user: JwtPayload) {
    return await this.alertsService.getAllExpirationContracts(
      user.organizationId,
    );
  }

  @Get('/expirations')
  async getExpirations(@User() user: JwtPayload) {
    return await this.alertsService.getExpirationConstracts(
      user.organizationId,
    );
  }

  @Get('/critic')
  async getCritic(@User() user: JwtPayload) {
    return await this.alertsService.getCriticalExpirationContracts(
      user.organizationId,
    );
  }
}
