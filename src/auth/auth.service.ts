import { Injectable,Logger} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
private readonly logger = new Logger(AuthService.name);
constructor(private prisma: PrismaService,
            private jwtService: JwtService) {}

async login(email: string, password: string) {
   const user = await this.prisma.user.findUnique({ where: { email } });
   if(!user) {
    this.logger.warn(`User with email ${email} not found`);
    throw new Error('Invalid credentials');
   }
   
   const isPasswordValid = await bcrypt.compare(password, user.password);
   if (!isPasswordValid) {
       this.logger.warn(`Invalid password for user ${email}`);
       throw new Error('Invalid credentials');
   }
   
   const payload = { 
       sub: user.id, 
       email: user.email, 
       role: user.role || 'USER' 
   };
   this.logger.log(`User ${email} logged in successfully with role: ${user.role || 'USER'}`);
   const token = this.jwtService.sign(payload);
   
   return { 
       message: user.role === 'ADMIN' ? 'Welcome Admin' : `Login successful ${user.name}`,
       access_token: token
   };
}
 async register(data:any)
    {
        this.logger.log(`Creating user with email: ${data.email}`);
        if(!data.password){
            this.logger.warn('Password is required for creating a user');
            throw new Error('Password is required');
        }
        data.password = await bcrypt.hash(data.password,10);
        await this.prisma.user.create({
            data,
        });
        return { message: 'User created successfully, Please Login!' };
    }

}