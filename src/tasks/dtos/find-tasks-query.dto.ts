import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '../enums/task-status.enum';

export class FindTasksQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (default: 1)',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Page size (default: 10, max: 100)',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({
    enum: TaskStatus,
    description: 'Filter tasks by status (optional)',
    example: TaskStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Text to search in task title or description',
    example: 'important',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
