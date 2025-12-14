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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './create-task.dto';
import { FindOneParams } from './find-one.params';
import { UpdateTaskDto } from './update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { Task } from './task.entity';
import { CreateTaskLabelDto } from './create-task-label.dto';

@ApiTags('Tasks API')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'Returns all tasks' })
  public async findAll(): Promise<Task[]> {
    return await this.tasksService.findAll();
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
