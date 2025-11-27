import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from './task.model';

export class UpdateTaskStatusDto {
  @ApiProperty({
    description: 'The new status of the task',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
