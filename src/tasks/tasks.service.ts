import { Injectable, NotFoundException } from '@nestjs/common';
import { ITask, TaskStatus } from './task.model';
import { CreateTaskDto } from './create-task.dto';
import { randomUUID } from 'crypto';
import { UpdateTaskStatusDto } from './update-task-status.dto';
import { UpdateTaskDto } from './update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';

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
    if (
      !this.isValidStatusTransition(task.status, updateTaskStatusDto.status)
    ) {
      throw new WrongTaskStatusException();
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
    if (
      updateTaskDto.status &&
      !this.isValidStatusTransition(task.status, updateTaskDto.status)
    ) {
      throw new WrongTaskStatusException();
    }
    Object.assign(task, updateTaskDto);
    return task;
  }

  private isValidStatusTransition(
    currentStatus: TaskStatus,
    newStatus: TaskStatus,
  ): boolean {
    const statusOrder = [
      TaskStatus.OPEN,
      TaskStatus.IN_PROGRESS,
      TaskStatus.DONE,
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(newStatus);
    return newIndex >= currentIndex;
  }

  delete(id: string): void {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.tasks.splice(index, 1);
    }
  }
}
