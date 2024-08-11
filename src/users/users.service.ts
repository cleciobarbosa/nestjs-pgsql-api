import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserRole } from './user-roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { Inject } from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CredentialsDto } from './dto/credentials.dto';
import { UpdateUserDto } from './dto/update-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('UserRepository')
    private userRepository: Repository<User>,
  ) { }

  async createAdminUser(createUserDto: CreateUserDto) {
    if (createUserDto.password != createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('As senhas não conferem');
    } else {
      return await this.create(createUserDto, UserRole.ADMIN);
    }
  }

  async create(signupDto: CreateUserDto, role: UserRole): Promise<User> {
    const { email, password, name } = signupDto;
    const user = new User();

    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);
    user.email = email;
    user.name = name;
    user.role = role;
    user.status = true;
    user.confirmationToken = crypto.randomBytes(32).toString('hex');

    try {
      await user.save();
      delete user.password;
      delete user.salt;
      return user;
    } catch (error) {
      if (error.code.toString() === '23505') {
        throw new ConflictException('Endereço de email já está em uso');
      } else {
        throw new InternalServerErrorException(
          'Erro ao salvar o usuário no banco de dados',
        );
      }
    }
  }
  findById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }
  async checkCredentials(credentialsDto: CredentialsDto): Promise<User> {
    const { email, password } = credentialsDto;
    const user = await this.userRepository.findOne({ where: { email, status: true } });

    if (user && (await user.checkPassword(password))) {
      return user;
    } else {
      return null;
    }
  }
  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
  async updateUser(updateuserDto: UpdateUserDto, id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: id } });
    const { name, email, role, status } = updateuserDto;
    user.name = name ? name : user.name;
    user.email = email ? email : user.email;
    user.role = role ? role : user.role;
    user.status = status ? status : user.status;
    try {
      return await user.save();

    } catch (error) {
      throw new InternalServerErrorException('Erro ao salvar o usuário no banco de dados');
    }
  }

  async deleteUser(id: string){
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new InternalServerErrorException('Erro ao deletar o usuário no banco de dados');
    }
  }
}