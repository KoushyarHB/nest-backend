import { IsString } from 'class-validator';

export class UpdateTaskLabelDto {
  @IsString()
  name: string;
}
