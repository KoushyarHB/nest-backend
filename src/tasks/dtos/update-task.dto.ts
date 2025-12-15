import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UpdateTaskLabelDto } from './update-task-label.dto';

// export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class UpdateTaskDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @IsOptional() @IsUUID() userId?: string;

  @ApiPropertyOptional({
    type: [UpdateTaskLabelDto],
    example: [{ name: 'course' }, { name: 'nestjs' }, { name: 'important' }],
    description: 'Array of labels (optional)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTaskLabelDto)
  labels?: UpdateTaskLabelDto[];
}
