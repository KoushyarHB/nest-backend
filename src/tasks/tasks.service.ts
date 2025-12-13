import { Injectable, BadRequestException } from '@nestjs/common';
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

  //=============================================================================

  // async create(dto: CreateTaskDto): Promise<Task> {
  //   const { userId, labels, ...taskData } = dto;

  //   const task = this.tasksRepository.create({
  //     ...taskData,
  //     user: { id: userId } as User,
  //     labels:
  //       labels?.map((l) => {
  //         const label = new TaskLabel();
  //         label.name = l.name;
  //         return label;
  //       }) || [],
  //   });

  //   try {
  //     return await this.tasksRepository.save(task);
  //   } catch (error) {
  //     if (
  //       error &&
  //       typeof error === 'object' &&
  //       'code' in error &&
  //       typeof (error as { code: unknown }).code === 'string' &&
  //       (error as { code: string }).code === '23505'
  //     ) {
  //       // PostgreSQL unique violation code
  //       throw new BadRequestException('Avoid sending duplicate labels');
  //     }
  //     throw error; // re-throw other errors
  //   }
  // }

  async create(dto: CreateTaskDto): Promise<Task> {
    const { userId, ...taskData } = dto;

    const task = this.tasksRepository.create({
      ...taskData,
      user: { id: userId } as User,
    });

    return this.tasksRepository.save(task);
  }

  // No — the .map() is NOT necessary at all.
  // You just discovered the true power of TypeORM cascade — and you're 100 % right.
  // What actually works (and why)
  // Your minimal version works perfectly.
  // → Because of @Type(() => CreateTaskLabelDto) in your DTO Nest automatically converts each object into a real TaskLabel entity instance
  // → task.labels becomes an array of actual TaskLabel objects
  // → cascade: true sees them → saves them automatically
  // → No .map() needed

  // So why did we write the .map() before?
  // Two reasons (both were overkill):

  // I was being extra cautious — some older TypeORM versions or misconfigured DTOs don’t auto-convert nested objects properly.
  // We were fighting the as TaskLabel error — when we manually did { name: l.name } as TaskLabel, it was a fake cast → TypeORM ignored it → we needed .map() to force creation.

  // But with your current perfect DTO setup (@Type, ValidateNested, etc.) → Nest does the conversion for us.

  // Why we have to manually map the user, but don’t have to for labels?
  // ![](/screenshots/why-user-needs-mapping.png)

  //=============================================================================

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

  // async update(task: Task, updateTaskDto: UpdateTaskDto): Promise<Task> {
  //   if (
  //     updateTaskDto.status &&
  //     !this.isValidStatusTransition(task.status, updateTaskDto.status)
  //   ) {
  //     throw new WrongTaskStatusException();
  //   }

  //   if (updateTaskDto.userId !== undefined) {
  //     task.user = { id: updateTaskDto.userId } as User;
  //   }

  //   if (updateTaskDto.title !== undefined) task.title = updateTaskDto.title;
  //   if (updateTaskDto.description !== undefined)
  //     task.description = updateTaskDto.description;
  //   if (updateTaskDto.status !== undefined) task.status = updateTaskDto.status;

  //   // === LABELS: Merge + deduplicate (no DB error ever) ===
  //   if (updateTaskDto.labels !== undefined) {
  //     const incomingNames = new Set(
  //       updateTaskDto.labels.map((l) => l.name.trim().toLowerCase()),
  //     );

  //     // Keep existing labels that are still wanted
  //     const preserved = task.labels.filter((label) =>
  //       incomingNames.has(label.name.trim().toLowerCase()),
  //     );

  //     // Add only truly new ones
  //     const newOnes = updateTaskDto.labels
  //       .filter(
  //         (l) =>
  //           !task.labels.some(
  //             (existing) =>
  //               existing.name.trim().toLowerCase() ===
  //               l.name.trim().toLowerCase(),
  //           ),
  //       )
  //       .map((l) => ({ name: l.name }) as TaskLabel);

  //     task.labels = [...preserved, ...newOnes];
  //   }

  //   return this.tasksRepository.save(task);
  // }

  async update(task: Task, updateTaskDto: UpdateTaskDto) {
    if (
      updateTaskDto.status &&
      !this.isValidStatusTransition(task.status, updateTaskDto.status)
    ) {
      throw new WrongTaskStatusException();
    }

    Object.assign(task, {
      ...(updateTaskDto.title !== undefined && { title: updateTaskDto.title }),
      ...(updateTaskDto.description !== undefined && {
        description: updateTaskDto.description,
      }),
      ...(updateTaskDto.status !== undefined && {
        status: updateTaskDto.status,
      }),
    });

    if (updateTaskDto.userId !== undefined) {
      task.user = { id: updateTaskDto.userId } as User;
    }

    if (updateTaskDto.labels !== undefined) {
      // Does the job but does not satidfy the duplicate constraint
      // task.labels = updateTaskDto.labels.map(
      //   (l) => ({ name: l.name }) as TaskLabel,
      // );

      // Doing the job of satisfying uniqueness
      const incomingNames = new Set(
        updateTaskDto.labels.map((l) => l.name.trim().toLowerCase()),
      );
      // Keep existing labels that are still wanted
      const preserved = task.labels.filter((label) =>
        incomingNames.has(label.name.trim().toLowerCase()),
      );
      // Add only truly new ones
      const newOnes = updateTaskDto.labels
        .filter(
          (l) =>
            !task.labels.some(
              (existing) =>
                existing.name.trim().toLowerCase() ===
                l.name.trim().toLowerCase(),
            ),
        )
        .map((l) => ({ name: l.name }) as TaskLabel);
      task.labels = [...preserved, ...newOnes];
    }
    return await this.tasksRepository.save(task);
  }
  //=============================================================================

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
    await this.tasksRepository.remove(task);
  }
}
