import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CurrenciesService } from '../services/currencies.service';

@ApiTags('catalogs')
@UseGuards(JwtAuthGuard)
@Controller('catalogs/currencies')
export class CurrenciesController {
  constructor(private readonly service: CurrenciesService) {}

  @Get()
  @ApiOperation({ summary: 'List available currencies' })
  @ApiResponse({ status: 200, description: 'Currencies' })
  findAll() {
    return this.service.findAll();
  }
}
