import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forRoot({
			name: 'api',
			type: 'postgres',
			port: parseInt(process.env.DB_API_PORT as string),
			host: process.env.DB_API_HOST,
			username: process.env.DB_API_USER,
			password: process.env.DB_API_PASSWORD,
			database: process.env.DB_API_DBNAME,
			synchronize: true,
		}),
		TypeOrmModule.forRoot({
			name: 'webapp',
			type: 'postgres',
			host: process.env.DB_WEBAPP_HOST,
			port: parseInt(process.env.DB_WEBAPP_PORT as string),
			username: process.env.DB_WEBAPP_USER,
			password: process.env.DB_WEBAPP_PASSWORD,
			database: process.env.DB_WEBAPP_DBNAME,
			entities: [],
			synchronize: true,
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
