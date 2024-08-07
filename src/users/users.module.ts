import { Module } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserRepository])],
    providers: [UsersService]
})
export class UsersModule {}
