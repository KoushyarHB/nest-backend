import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  public async create(user: User) {
    return await this.usersRepository.save(user);
  }

  public async getUsers() {
    const [users, totalUsers] = await this.usersRepository.findAndCount({
      relations: ['tasks'],
    });
    return { users, totalUsers };
  }
}
