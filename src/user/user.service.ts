import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}
    private readonly logger  = new Logger(UserService.name);

    async getUser(id:string) 
    {
        this.logger.log(`Fetching user with id: ${id}`);
       return await this.prisma.user.findUnique({
            where : { id },
    });
    }
   
    
}
