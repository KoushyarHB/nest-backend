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
import { TaskStatus } from './task.model';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class UpdateLabelDto {
  @IsString()
  name: string;
}

// export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class UpdateTaskDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @IsOptional() @IsUUID() userId?: string;

  @ApiPropertyOptional({
    type: [UpdateLabelDto],
    example: [{ name: 'course' }, { name: 'nestjs' }, { name: 'important' }],
    description: 'Array of labels (optional)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateLabelDto)
  labels?: UpdateLabelDto[];
}
