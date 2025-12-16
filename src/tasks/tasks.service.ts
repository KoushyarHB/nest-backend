import { Injectable } from '@nestjs/common';
import { TaskStatus } from './enums/task-status.enum';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { TaskLabel } from './entities/task-label.entity';
import { CreateTaskLabelDto } from './dtos/create-task-label.dto';
import { PaginatedResponse } from './dtos/paginated.response';
import { FindTasksQueryDto } from './dtos/find-tasks-query.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    // @InjectRepository(User)
    // private readonly usersRepository: Repository<User>,
  ) {}

  // async findAll(params: FindTasksQueryDto): Promise<PaginatedResponse<Task>> {
  //   const { page = 1, pageSize = 10, status, search } = params;

  //   // 1. Initialize an empty WHERE clause object
  //   const where: FindOptionsWhere<Task> | FindOptionsWhere<Task>[] = {};

  //   // 2. Add filtering by status if provided
  //   if (status) {
  //     where.status = status;
  //   }

  //   // 3. Add filtering by search if provided (This is the core lecture concept)
  //   if (search) {
  //     const [items, totalItems] = await this.tasksRepository.findAndCount({
  //       relations: ['user', 'labels'],
  //       skip: (page - 1) * pageSize,
  //       take: pageSize,
  //       where: [
  //         { ...where, title: ILike(`%${search}%`) },
  //         { ...where, description: ILike(`%${search}%`) },
  //       ],
  //     });

  //     const totalPages = Math.ceil(totalItems / pageSize);
  //     return { totalItems, page, pageSize, totalPages, items };
  //   }

  //   const [items, totalItems] = await this.tasksRepository.findAndCount({
  //     relations: ['user', 'labels'],
  //     skip: (page - 1) * pageSize,
  //     take: pageSize,
  //     where,
  //   });

  //   const totalPages = Math.ceil(totalItems / pageSize);

  //   return { totalItems, page, pageSize, totalPages, items };
  // }

  // Search advanced implementation with query builder
  async findAll(params: FindTasksQueryDto): Promise<PaginatedResponse<Task>> {
    const { page = 1, pageSize = 10, status, search } = params;

    const qb = this.tasksRepository.createQueryBuilder('task');

    qb.leftJoinAndSelect('task.user', 'user').leftJoinAndSelect(
      'task.labels',
      'labels',
    );

    if (status) {
      qb.where('task.status = :status', { status });
    }

    if (search) {
      const conditionMethod = status ? 'andWhere' : 'where';
      qb[conditionMethod](
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const skip = (page - 1) * pageSize;
    qb.skip(skip).take(pageSize);
    const [items, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / pageSize);
    return { totalItems, page, pageSize, totalPages, items };
  }

  async testLabelFiltering() {
    console.log('=== Testing label filtering ===');

    // 1. Exact match with find() – works, but only loads matching labels
    const exact = await this.tasksRepository.find({
      where: { labels: { name: 'nestjs' } },
      relations: ['labels'],
    });
    console.log(`Exact match "nestjs" (find()): ${exact.length} tasks`);
    exact.forEach((t) =>
      console.log(`  Task ${t.id}: ${t.labels.length} labels loaded`),
    );

    // 2. Partial match with find() – works, but filters children (only matching labels loaded)
    const partialFind = await this.tasksRepository.find({
      where: { labels: { name: ILike('%nest%') } },
      relations: ['labels'],
    });
    console.log(`Partial match "%nest%" (find()): ${partialFind.length} tasks`);
    partialFind.forEach((t) =>
      console.log(
        `  Task ${t.id}: ${t.labels.length} labels loaded (only matching ones)`,
      ),
    );

    // 3. Multiple labels OR – impossible with simple find() where
    try {
      await this.tasksRepository.find({
        where: { labels: [{ name: 'nestjs' }, { name: 'grok' }] },
        relations: ['labels'],
      });
      console.log('Multiple labels OR unexpectedly worked');
    } catch (error) {
      console.log(
        'Multiple labels OR filter: Not supported (error expected) — correct',
      );
    }

    // 4. Query Builder – loads ALL labels + filters tasks correctly
    const qb = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.labels', 'label');

    // Filter tasks that have at least one label matching '%nest%'
    qb.andWhere(
      `EXISTS (
      SELECT 1 FROM task_label sub_label
      WHERE sub_label."taskId" = task.id
      AND LOWER(sub_label.name) LIKE LOWER(:search)
    )`,
      { search: '%nest%' },
    );

    const qbResult = await qb.getMany();
    console.log(
      `Query Builder "%nest%" (all labels loaded): ${qbResult.length} tasks`,
    );
    qbResult.forEach((t) =>
      console.log(
        `  Task ${t.id}: ${t.labels.length} labels loaded (ALL labels)`,
      ),
    );

    return {
      exact,
      partialFind,
      qbResult,
    };
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

  async addLabels(task: Task, labels: CreateTaskLabelDto[]) {
    const labelEntities = labels.map((l) => ({ name: l.name }) as TaskLabel);
    const newLabelEntities = labelEntities.filter(
      (l) => !task.labels.some((tl) => tl.name === l.name),
    );
    task.labels = [...task.labels, ...newLabelEntities];
    return await this.tasksRepository.save(task);
  }

  async deleteLabels(task: Task, labels: CreateTaskLabelDto[]) {
    const labelEntities = labels.map((l) => ({ name: l.name }) as TaskLabel);
    task.labels = task.labels.filter(
      (l) => !labelEntities.some((tl) => tl.name === l.name),
    );
    await this.tasksRepository.save(task);
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
