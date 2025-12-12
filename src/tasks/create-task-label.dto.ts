import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskLabelDto {
  @ApiProperty({ example: 'nestjs' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
