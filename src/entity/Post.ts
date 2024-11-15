import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from './User';

@Entity("post")
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  title!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  description!: string;

  @ManyToOne(() => User, (user: User) => user.posts, { nullable: false })
  user!: User;
}