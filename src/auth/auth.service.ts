import { Injectable } from '@nestjs/common';
import { UserService } from 'src/users/user.service';
import { RegisterDto } from './dtos/register.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  public async register(registerDto: RegisterDto) {
    const user = new User();
    user.name = registerDto.name;
    user.email = registerDto.email;
    user.password = registerDto.password;
    console.log(registerDto);
    return await this.userService.create(user);
  }
}
