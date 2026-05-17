import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/webapp/users/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'webapp')
    private readonly userRepo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.userRepo.findOneBy({ email });
  }

  async create(
    userDto: RegisterUserDto,
    organizationId: string,
  ): Promise<User> {
    const user = new User();

    user.organization_id = organizationId;
    user.email = userDto.email;
    user.password_hash = await bcrypt.hash(userDto.password, 12);
    user.name = userDto.first_name;
    user.last_name = userDto.last_name;

    return this.userRepo.save(user);
  }
}
