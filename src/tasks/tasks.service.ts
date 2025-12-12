import { Injectable } from '@nestjs/common';
import { TaskStatus } from './task.model';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { Repository, In } from 'typeorm';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { TaskLabel } from './task-label.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    // @InjectRepository(User)
    // private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Task[]> {
    return await this.tasksRepository.find({ relations: ['user', 'labels'] });
  }

  async findOne(id: string): Promise<Task | null> {
    return await this.tasksRepository.findOne({
      where: { id },
      relations: ['user', 'labels'],
    });
  }

  // async create(createTaskDto: CreateTaskDto): Promise<Task> {
  //   const { assignees, ...taskData } = createTaskDto;
  //   const task = this.tasksRepository.create(taskData);
  //   if (assignees && assignees.length > 0) {
  //     const users = await this.usersRepository.findBy({ id: In(assignees) });
  //     task.assignees = users;
  //   }
  //   return this.tasksRepository.save(task);
  // }

  async create(dto: CreateTaskDto): Promise<Task> {
    const { userId, labels, ...taskData } = dto;

    const task = this.tasksRepository.create({
      ...taskData,
      user: { id: userId } as User,
      labels:
        labels?.map((l) => {
          const label = new TaskLabel();
          label.name = l.name;
          return label;
        }) || [],
    });

    return this.tasksRepository.save(task);
  }

  // Commented out cuz it does not handle relations
  // async update(task: Task, updateTaskDto: UpdateTaskDto): Promise<Task> {
  //   if (
  //     updateTaskDto.status &&
  //     !this.isValidStatusTransition(task.status, updateTaskDto.status)
  //   ) {
  //     throw new WrongTaskStatusException();
  //   }
  //   Object.assign(task, updateTaskDto); //this only updates primitive fields, not the relations
  //   return await this.tasksRepository.save(task);
  // }

  async update(task: Task, updateTaskDto: UpdateTaskDto): Promise<Task> {
    if (
      updateTaskDto.status &&
      !this.isValidStatusTransition(task.status, updateTaskDto.status)
    ) {
      throw new WrongTaskStatusException();
    }
    if (updateTaskDto.userId !== undefined) {
      task.user = { id: updateTaskDto.userId } as User;
    }
    if (updateTaskDto.labels !== undefined) {
      task.labels = updateTaskDto.labels.map((l) => {
        const label = new TaskLabel();
        label.name = l.name;
        return label;
      });
    }
    Object.assign(task, {
      title: updateTaskDto.title,
      description: updateTaskDto.description,
      status: updateTaskDto.status,
    });

    return this.tasksRepository.save(task);
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

  async delete(task: Task): Promise<void> {
    await this.tasksRepository.delete(task);
  }
}
