import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VoteService {
constructor(private prisma :PrismaService){}
private readonly logger = new Logger(VoteService.name);
async createVote(pollId : string, userId : string, optionId : string) {
       const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true, allowedUsers: true },
    });
    if (!poll) throw new Error('Poll not found');

    if (!poll.isPublic) {
      const allowed = await this.prisma.pollAllowedUsers.findUnique({
        where: { pollId_userId: { pollId, userId } },
      });
      if (!allowed) throw new Error('Not eligible to vote');
    }
    
  const option = poll.options.find((o) => o.id === optionId);
    if (!option) throw new Error('Invalid option, Option not in poll');
  
    const existingVote = await this.prisma.vote.findUnique({
      where: { pollId_userId: { pollId, userId } },
    });
    if (existingVote) throw new BadRequestException('User already voted on this poll');
    
    try {
        this.logger.log(`User ${userId} voting on poll ${pollId} for option ${optionId}`);
      const [vote, updatedOption] = await this.prisma.$transaction([
        this.prisma.vote.create({ data: { pollId, userId, optionId } }),
        this.prisma.pollOption.update({ where: { id: optionId }, data: { votes: { increment: 1 } } }),
      ]);
      return { success: true, message: 'Vote cast successfully' };
    } catch (e: any) {
      if (e.code === 'P2002') throw new BadRequestException('User already voted');
      throw e;
    }
  }


}

