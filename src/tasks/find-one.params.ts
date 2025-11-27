import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindOneParams {
  @ApiProperty({
    description: 'The unique identifier of the task',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;
}
