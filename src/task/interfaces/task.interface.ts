import { CreateTaskDTO, UpdateTaskDTO } from '../dto/task.dto';

export interface Task{
    id: string;
    description:string;
    isDone:boolean;
    createdAt: Date;
}

export interface TaskService{
    findAll(): Promise<Task[]>;
    findById(id: string): Promise<Task>;
    create(CreateTaskDTO: CreateTaskDTO): Promise<Task>;
    update(id: string, UpdateTaskDTO: UpdateTaskDTO): Promise<Task>;
    delete(id: string): Promise<void>;
}