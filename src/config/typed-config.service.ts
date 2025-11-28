import { ConfigService } from '@nestjs/config';
import { ConfigTypes } from './config.types';

export class TypedConfigService extends ConfigService<ConfigTypes> {}
