import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PollModule } from './poll/poll.module';
import { VoteModule } from './vote/vote.module';


@Module({
  imports: [UserModule, AuthModule,ConfigModule.forRoot({
      isGlobal: true,
  }), PollModule, VoteModule],
  controllers: [],
  providers: [AppService,PrismaService],
})
export class AppModule {}
