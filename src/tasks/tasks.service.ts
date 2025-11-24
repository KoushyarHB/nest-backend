import { Injectable, NotFoundException } from '@nestjs/common';
import { ITask } from './task.model';
import { CreateTaskDto } from './create-task.dto';
import { randomUUID } from 'crypto';
import { UpdateTaskStatusDto } from './update-task-status.dto';
import { UpdateTaskDto } from './update-task.dto';

@Injectable()
export class TasksService {
  private tasks: ITask[] = [];

  findAll(): ITask[] {
    return this.tasks;
  }

  findOne(id: string): ITask | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  create(createTaskDto: CreateTaskDto): ITask {
    const task: ITask = { id: randomUUID(), ...createTaskDto };
    this.tasks.push(task);
    return task;
  }

  updateStatus(id: string, updateTaskStatusDto: UpdateTaskStatusDto): ITask {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    task.status = updateTaskStatusDto.status;
    return task;
  }

  update(id: string, updateTaskDto: UpdateTaskDto): ITask {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    // Object.keys(task).forEach((key) => {
    //   if (ArrayFromObject(updateTaskDto).includes(key)) {
    //     task[key] = updateTaskDto[key];
    //   }
    // });
    Object.assign(task, updateTaskDto);
    return task;
  }

  delete(id: string): void {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.tasks.splice(index, 1);
    }
  }
}
