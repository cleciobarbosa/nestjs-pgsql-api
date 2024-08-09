import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserRole } from '../users/user-roles.enum';
import { UsersService } from '../users/users.service';
import { CredentialsDto } from '../users/dto/credentials.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UsersService
    ) { }

    async signUp(dto: CreateUserDto): Promise<User> {
        if (dto.password != dto.passwordConfirmation) {
            throw new Error('As senhas não conferem');
        } else {
            return this.userService.create(dto, UserRole.USER);
        }
    }

    async signIn(dto: CredentialsDto) {
        const user = await this.userService.checkCredentials(dto);

        if (!user) {
            throw new Error('Credenciais inválidas');
        }
        const jwtPayload = {
            id: user.id
        }
        const token = await this.jwtService.sign(jwtPayload);

        return { token };
    }
}
