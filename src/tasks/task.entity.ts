import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TaskStatus } from './task.model';
import { User } from 'src/users/user.entity';
import { TaskLabel } from './task-label.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: '100',
    nullable: false,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.OPEN,
    nullable: false,
  })
  status: TaskStatus;

  // @Column()
  // userId: string;

  // Why do we use arrow functions?
  // To avoid circular import crashes
  // The arrow function () => User is just a function that returns the User class — it is not executed immediately when the file is imported. This helps us avoid circular imports crash.

  // @ManyToMany(() => User, (user) => user.tasks)
  // @JoinTable()
  // assignees: User[];

  @ManyToOne(() => User, (user) => user.tasks)
  user: User;

  @OneToMany(() => TaskLabel, (taskLabel) => taskLabel.task, {
    cascade: true,
    orphanRemoval: true,
  } as { cascade: boolean; orphanRemoval: boolean })
  labels: TaskLabel[];
}
