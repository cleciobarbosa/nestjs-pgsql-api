import { User } from '../user.entity';

export class ReturnUserDto {
  user: User;
  message: string;

  constructor(){
    this.message ="";
    this.user = new User();
  }
}