import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from './task.model';

export class CreateTaskDto {
  @ApiProperty({
    description: 'The title of the task',
    example: 'Complete project documentation',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The description of the task',
    example: 'Write comprehensive documentation for the project',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The status of the task',
    enum: TaskStatus,
    example: TaskStatus.OPEN,
  })
  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
