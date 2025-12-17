import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  BadRequestException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiExtraModels,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { FindOneParams } from './dtos/find-one.params';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { Task } from './entities/task.entity';
import { CreateTaskLabelDto } from './dtos/create-task-label.dto';
import { PaginatedResponse } from './dtos/paginated.response';
import {
  FindTasksQueryDto,
  sortableFields,
  sortOrder,
} from './dtos/find-tasks-query.dto';
import { TaskStatus } from './enums/task-status.enum';

@ApiTags('Tasks API')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('test-labels')
  async testLabels() {
    return this.tasksService.testLabelFiltering();
  }

  @Get()
  @ApiExtraModels(FindTasksQueryDto)
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Page size (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TaskStatus,
    description: 'Filter tasks by status (optional)',
    example: TaskStatus.IN_PROGRESS,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Text to search in task title or description',
    example: 'important',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated tasks',
    type: PaginatedResponse<Task>,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: sortableFields,
    description: 'Field to sort by',
    example: 'title',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: sortOrder,
    description: 'Sort order',
    example: 'DESC',
  })
  public async findAll(
    @Query() queryParams: FindTasksQueryDto,
  ): Promise<PaginatedResponse<Task>> {
    return await this.tasksService.findAll(queryParams);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Returns the task' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  public async findOne(@Param() params: FindOneParams): Promise<Task> {
    return await this.findOneOrFail(params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  public async create(@Body() createTaskDto: CreateTaskDto) {
    await this.tasksService.create(createTaskDto);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid task status transition' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  public async updateTaskStatus(
    @Param() params: FindOneParams,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.findOneOrFail(params.id);
    try {
      return await this.tasksService.update(task, updateTaskDto);
    } catch (error) {
      if (error instanceof WrongTaskStatusException) {
        throw new BadRequestException([error.message]);
      }
      throw error;
    }
  }

  @Post('/:id/labels')
  @ApiOperation({ summary: 'Add labels to a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: CreateTaskLabelDto, isArray: true })
  @ApiResponse({ status: 201, description: 'Labels added successfully' })
  public async addLabels(
    @Param() params: FindOneParams,
    @Body() labels: CreateTaskLabelDto[],
  ): Promise<Task> {
    const task = await this.findOneOrFail(params.id);
    return await this.tasksService.addLabels(task, labels);
  }

  @Delete('/:id/labels')
  @ApiOperation({ summary: 'Delete labels from a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: CreateTaskLabelDto, isArray: true })
  @ApiResponse({ status: 204, description: 'Labels deleted successfully' })
  public async deleteLabels(
    @Param() params: FindOneParams,
    @Body() labels: CreateTaskLabelDto[],
  ): Promise<void> {
    const task = await this.findOneOrFail(params.id);
    await this.tasksService.deleteLabels(task, labels);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  public async delete(@Param() params: FindOneParams): Promise<void> {
    const task = await this.findOneOrFail(params.id);
    await this.tasksService.delete(task);
  }

  private async findOneOrFail(id: string): Promise<Task> {
    const task = await this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException();
    }
    return task;
  }
}
