import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { DatabaseApiModule } from '../../database/database-api.module';
import { DatabaseWebappModule } from '../../database/database-webapp.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from 'src/entities/api/organizations/organization.entity';
import { User } from 'src/entities/webapp/users/user.entity';

@Module({
	controllers: [AuthController],
	providers: [AuthService],
	imports: [DatabaseApiModule,
		DatabaseWebappModule,
		TypeOrmModule.forFeature([Organization], 'api'),
		TypeOrmModule.forFeature([User], 'webapp')
	],
})
export class AuthModule { }
