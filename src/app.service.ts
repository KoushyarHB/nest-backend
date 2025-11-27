import { Injectable } from '@nestjs/common';
import { DummyService } from './dummy/dummy.service';
import { LoggerService } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    private readonly dummyService: DummyService,
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  getHello(): string {
    const prefix = this.configService.get<string>('app.messagePrefix');
    const dummifiedMessage = this.dummyService.dummifyMessage('Hello World!');
    const formattedMessage = this.loggerService.log(
      prefix + ' ' + dummifiedMessage,
    );
    return formattedMessage;
  }
}
