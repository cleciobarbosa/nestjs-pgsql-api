import { Controller, Post, Body, ValidationPipe, UseGuards, Get, Param, Patch, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ReturnUserDto } from './dto/return-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../auth/role.decorator';
import { UserRole } from './user-roles.enum';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateUserDto } from './dto/update-users.dto';
import { GetUser } from '../auth/get-user.decorator';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Post()
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  async createAdminUser(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<ReturnUserDto> {
    const user = await this.usersService.createAdminUser(createUserDto);
    return {
      user,
      message: 'Administrador cadastrado com sucesso',
    };
  }

  @Get(':id')
  @Role(UserRole.ADMIN)
  async getUser(@Param('id') id: string): Promise<ReturnUserDto> {
    const user = await this.usersService.findById(id);
    delete user.password;
    delete user.salt;
    delete user.confirmationToken;
    delete user.recoverToken;

    return {
      user,
      message: 'Usário recuperado com sucesso',
    };
  }

  @Patch(':id')
  async updateUser(
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @GetUser() user: User,
    @Param('id') id: string,
  ) {
    if (user.role !== UserRole.ADMIN && user.id.toString() !== id) {
      throw new Error('Usário não autorizado');
    } else {
      return await this.usersService.updateUser(updateUserDto, id);
    }
  }

  @Delete(':id')
  @Role(UserRole.ADMIN)
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
    return {
      message: 'Usário excluído com sucesso',
    }
  }

}