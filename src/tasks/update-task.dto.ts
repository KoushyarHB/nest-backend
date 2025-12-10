import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { IsString } from 'class-validator';
import { IsUUID } from 'class-validator';
import { TaskStatus } from './task.model';

// export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class UpdateTaskDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @IsOptional() @IsUUID() userId?: string; // ← explicit
}
