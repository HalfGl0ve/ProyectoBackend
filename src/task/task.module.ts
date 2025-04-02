import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskModel, TaskSchema } from './schemas/task.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: TaskModel.name, schema: TaskSchema }]),
    ],
    controllers: [TaskController],
    providers: [TaskService],
    exports: [TaskService],
})
export class TaskModule {}
