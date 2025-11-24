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
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import type { ITask } from './task.model';
import { CreateTaskDto } from './create-task.dto';
import { FindOneParams } from './find-one.params';
// import { UpdateTaskStatusDto } from './update-task-status.dto';
import { UpdateTaskDto } from './update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  public findAll(): ITask[] {
    return this.tasksService.findAll();
  }

  @Get('/:id')
  public findOne(@Param() params: FindOneParams): ITask {
    return this.findOneOrFail(params.id);
  }

  @Post()
  public create(@Body() createTaskDto: CreateTaskDto) {
    this.tasksService.create(createTaskDto);
  }

  // @Patch('/:id/status')
  // public updateTaskStatus(
  //   @Param() params: FindOneParams,
  //   @Body() body: UpdateTaskStatusDto,
  // ): ITask {
  //   this.findOneOrFail(params.id);
  //   return this.tasksService.updateStatus(params.id, body);
  // }

  @Patch('/:id')
  public updateTaskStatus(
    @Param() params: FindOneParams,
    @Body() updateTaskDto: UpdateTaskDto,
  ): ITask {
    this.findOneOrFail(params.id);
    return this.tasksService.update(params.id, updateTaskDto);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public delete(@Param() params: FindOneParams): void {
    this.findOneOrFail(params.id);
    this.tasksService.delete(params.id);
  }

  private findOneOrFail(id: string): ITask {
    const task = this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException();
    }
    return task;
  }
}
