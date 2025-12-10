import { IsNotEmpty, IsString, IsEnum, IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from './task.model';
import { User } from 'src/users/user.entity';

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

  // @ApiProperty({
  //   description: 'Array of user IDs to assign',
  //   example: ['user-uuid-1', 'user-uuid-2'],
  //   isArray: true,
  // })
  // @IsArray()
  // @IsUUID('all', { each: true })
  // assignees: string[];

  @ApiProperty({
    description: 'The user ID of the user owning the task',
    example: '750afea3-bbd8-47ac-90a8-d4eee10ac97b',
  })
  @IsUUID()
  userId: string;
}
