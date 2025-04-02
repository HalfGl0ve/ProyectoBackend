import { Injectable, NotFoundException } from '@nestjs/common';
import {Task, TaskService as TaskServiceInterface} from './interfaces/task.interface'
import { CreateTaskDTO, UpdateTaskDTO } from './dto/task.dto';
import {v4 as uuidv4} from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { TaskDocument, TaskModel } from './schemas/task.schema';
import { Model } from 'mongoose';

@Injectable()
export class TaskService implements TaskServiceInterface{

    constructor(
        @InjectModel(TaskModel.name) private taskModel: Model<TaskDocument>,
    ) {}

    async findAll(): Promise<Task[]>{
        const tasks = await this.taskModel.find().lean().exec();
        return tasks.map(task => this.mapToTaskInterface(task));
    }

    //Funcion para ver detalle de una tarea
    async findById(id: string): Promise<Task> {
        const task = await this.taskModel.findById(id).lean().exec();

        if(!task){
            throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
        }

        return this.mapToTaskInterface(task);
    }

    //Funcion para crear una tarea
    async create(createTaskDto: CreateTaskDTO): Promise<Task> {
        const newTask = new this.taskModel(createTaskDto);
        const savedTask = await newTask.save();
        return this.mapToTaskInterface(savedTask.toObject());
    }

    //Funcion para actualizar una tarea
    async update(id: string, updateTaskDto: UpdateTaskDTO): Promise<Task> {
        const updatedTask = await this.taskModel
            .findByIdAndUpdate(id, updateTaskDto, {new: true})
            .lean()
            .exec();
        if(!updatedTask){
            throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
        }
        return this.mapToTaskInterface(updatedTask);
    }


    //Funcion para eliminar una tarea
    async delete(id: string): Promise<void> {
        const result = await this.taskModel.findByIdAndDelete(id).exec();
        if(!result){
            throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
        }
    }

    private mapToTaskInterface(taskDoc: any): Task {
        return{
            id: taskDoc._id ? taskDoc._id.toString() : taskDoc.id,
            description: taskDoc.description,
            isDone: taskDoc.isDone,
            createdAt: taskDoc.createdAt,
        };
    }
}


