import { Body, Controller, Get, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CredentialsDto } from '../users/dto/credentials.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/user.entity';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService
    ) { }

    @Post('/signup')
    async signUp(
        @Body(ValidationPipe) createUserDto: CreateUserDto
    ): Promise<{ message: string }> {
        await this.authService.signUp(createUserDto);
        return { message: 'Usário criado com sucesso' }
    }

    @Post('/login')
    async signIn(
        @Body(ValidationPipe) credentialsDto: CredentialsDto
    ): Promise<{ token: string }> {
        return await this.authService.signIn(credentialsDto);
    }

    @Get('/me')
    @UseGuards(AuthGuard())
    getMe(@Req() req): User {
        return req.user;
    }
}
