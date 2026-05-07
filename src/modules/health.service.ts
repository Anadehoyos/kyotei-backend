import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource('api') private apiDB: DataSource,
    @InjectDataSource('webapp') private webappDB: DataSource,
  ) {}

  check() {
    const api = this.apiDB.isInitialized;
    const webapp = this.webappDB.isInitialized;

    return {
      status: api && webapp ? 'ok' : 'error',
      databases: {
        api: api ? 'connected' : 'disconnected',
        webapp: webapp ? 'connected' : 'disconnected',
      },
    };
  }
}
