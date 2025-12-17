import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('auth.secret');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined');
        }
        const expiresIn = configService.get<string>('auth.expiresIn') || '7d';
        return {
          secret,
          signOptions: {
            expiresIn: parseInt(expiresIn),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'JWT_CONFIG_TEST',
      useFactory: (configService: ConfigService) => {
        console.log(
          'JWT Secret loaded:',
          (configService.get('auth.secret') as string)?.slice(0, 10) + '...',
        );
        return true;
      },
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
