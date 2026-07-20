import { Controller, Get, UseGuards } from '@nestjs/common';
import { RequirePermissions } from 'src/modules/auth/decorators/permission.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/modules/auth/guards/permission.guard';
import { ReportsService } from '../service/reports.service';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { type JwtPayload } from 'src/common/interface/jwt-payload.interface';

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('ver_reportes')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('/kpis')
  async getReportsKpis(@User() user: JwtPayload) {
    const organizationId = user.organizationId;
    const kpis = await this.reportsService.getReportsKpis(organizationId);
    return kpis;
  }

  @Get('/contracts-by-category')
  async getContractsByCategory(@User() user: JwtPayload) {
    const organizationId = user.organizationId;
    const contracts =
      await this.reportsService.getContractsByCategory(organizationId);
    return contracts;
  }

  @Get('/suppliers-by-contract-value')
  async getSuppliersByContractValue(@User() user: JwtPayload) {
    const organizationId = user.organizationId;
    const suppliers =
      await this.reportsService.getSuppliersByContractValue(organizationId);
    return suppliers;
  }

  @Get('/contracts-detail')
  async getContractsDetail(@User() user: JwtPayload) {
    const organizationId = user.organizationId;
    const rows = await this.reportsService.getContractsDetail(organizationId);
    return rows;
  }
}
