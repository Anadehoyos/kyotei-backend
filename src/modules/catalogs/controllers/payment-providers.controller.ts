import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PaymentProvidersService } from '../services/payment-providers.service';

@ApiTags('catalogs')
@UseGuards(JwtAuthGuard)
@Controller('catalogs/payment-providers')
export class PaymentProvidersController {
  constructor(private readonly service: PaymentProvidersService) {}

  @Get()
  @ApiOperation({ summary: 'List available payment providers' })
  @ApiResponse({ status: 200, description: 'Payment providers' })
  findAll() {
    return this.service.findAll();
  }
}
