import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePollDto } from './dto/create-poll';

@Injectable()
export class PollService {
    constructor(private prisma: PrismaService) {}
    private readonly logger = new Logger(PollService.name);
     
     async createPoll(poll: CreatePollDto, userId: string) {
      try {
        if (poll.options.length < 2) throw new Error("At least two options are required");
        if (poll.options.length > 10) throw new Error("No more than 10 options are allowed");
        if (poll.duration < 5) throw new Error("Duration must be at least 5 minutes");
        if(poll.duration > 120) throw new Error("Duration cannot exceed 2 hours");
        
        const expiry = new Date(Date.now() + poll.duration * 60_000);

        const createdPoll = await this.prisma.poll.create({
            data: {
                title: poll.title,
                description: poll.description,
                expiresAt: expiry,
                createdBy: userId,
                isPublic: poll.isPublic,
                options: { 
                    create: poll.options.map((o) => ({ option: o })) 
                },
            },
            include: { options: true },
        });

        if (!poll.isPublic) {
            await this.prisma.pollAllowedUsers.create({
                data: {
                    pollId: createdPoll.id,
                    userId: userId
                }
            });
        }

        this.logger.log(`Poll created with title: ${poll.title} by user: ${userId}`);
        return {'poll created': poll.title, 'expiresAt': expiry};
    } catch(error) {
        this.logger.error(`Error creating poll with title: ${poll.title} by user: ${userId} - ${error.message}`);
        throw error;
    }
     }


  async listPolls(userId: string) {
    try {
    this.logger.log(`Listing polls for user: ${userId}`);
    
    // Check if user is admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    if (user?.role === 'ADMIN') {
      // Admins can see all polls
      const allPolls = await this.prisma.poll.findMany({
        where: { isDeleted: false, expiresAt: { gt: new Date() } },
        include: { options: true },
        orderBy: { createdAt: 'desc' }
      });
      this.logger.log(`Found ${allPolls.length} total polls for admin user: ${userId}`);
      return allPolls;
    }
    
    // Regular users see only public polls and private polls they have access to
    const publicPolls = await this.prisma.poll.findMany({
      where: { isPublic: true ,isDeleted: false, expiresAt: { gt: new Date() } },
      include: { options: true },
    });
    
    const privatePolls = await this.prisma.poll.findMany({
      where: { isPublic: false ,isDeleted: false,allowedUsers: { some: { userId } }, expiresAt: { gt: new Date() } },
      include: { options: true },
    });
    this.logger.log(`Found ${publicPolls.length} public polls and ${privatePolls.length} private polls for user: ${userId}`);
    return [...publicPolls, ...privatePolls];
} catch (error) {
    this.logger.error(`Error listing polls for user: ${userId} - ${error.message}`);
    throw error;
  }
}

  async getPoll(pollId: string, userId: string) {
    try{
    this.logger.log(`Fetching poll with id: ${pollId} for user: ${userId}`);
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId , isDeleted: false},
      include: { options: true },

    });
    if (!poll) throw new Error("Poll not found");
    
    // Check if user is admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    if (user?.role === 'ADMIN') {
      // Admins can access any poll
      return poll;
    }
    
    if (!poll.isPublic) {
        const isAllowed = await this.prisma.poll.findFirst({
          where: { id: pollId, allowedUsers: { some: { userId } } },
        });
        if (!isAllowed) throw new Error("Not allowed to access this poll"); 
    }
    return poll;
}
catch(error){
    this.logger.error(`Error fetching poll with id: ${pollId} for user: ${userId} - ${error.message}`);
    throw error;
  }
}

  async deletePoll(pollId: string, userId: string) {
    try {
        this.logger.log(`Deleting poll with id: ${pollId} by user: ${userId}`);
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId , isDeleted: false, createdBy: userId },  
    });
    if (!poll) throw new Error("Poll not found or you are not the creator");
    const softdelete = this.prisma.poll.update({
      where: { id: pollId },
      data: { isDeleted: true },
    });
    return { message: 'Poll deleted successfully', poll: softdelete };
} catch (error) {
    this.logger.error(`Error deleting poll with id: ${pollId} by user: ${userId} - ${error.message}`);
    throw error;
  }
}

  async getResults(pollId: string, userId?: string) {
    try {
    this.logger.log(`Fetching results for poll with id: ${pollId} by user: ${userId || 'Guest'}`);
    const poll = await this.prisma.poll.findUnique({ where: { id: pollId }, include: { options: true } });
    if (!poll) throw new NotFoundException('Poll not found');
    if (!poll.isPublic) {
      const allowed = userId && (await this.prisma.pollAllowedUsers.findUnique({
        where: { pollId_userId: { pollId, userId } },
      }));
      if (!allowed) throw new ForbiddenException('Not allowed to view results');
    }
    return poll.options.map((o) => ({ id: o.id, option: o.option, votes: o.votes }));
  } catch (error) {
    this.logger.error(`Error fetching results for poll with id: ${pollId} by user: ${userId || 'Guest'} - ${error.message}`);
    throw error;
  }
}

  async allowPoll(pollId: string, email: string, userId: string) {
    try{
    const poll = await this.prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) throw new NotFoundException('Poll not found');
    if (poll.createdBy !== userId) throw new ForbiddenException('Only creator can allow users');
    if (poll.isPublic) throw new BadRequestException('Poll is public, no need to allow users');

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    if (user.id === poll.createdBy) throw new BadRequestException('Creator already has access');

    const alreadyAllowed = await this.prisma.pollAllowedUsers.findUnique({
      where: { pollId_userId: { pollId, userId: user.id } },
    });
    if (alreadyAllowed) throw new BadRequestException('User already allowed');

    await this.prisma.pollAllowedUsers.create({ data: { pollId, userId: user.id } });
    return { message: `User ${email} allowed to access the poll` };
    }
    catch(error){
        this.logger.error(`Error allowing user ${email} to poll ${pollId} by user ${userId} - ${error.message}`);
      throw error;
    }
}
    async editPoll(pollId: string, editPollDto: any, userId: string) {
    try{
        this.logger.log(`Editing poll with id: ${pollId} by user: ${userId}`);
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId, createdBy: userId },
    });
    if (!poll) throw new NotFoundException('Poll not found or you are not the creator');
    const updatedPoll = await this.prisma.poll.update({
      where: { id: pollId },
      data: { createdBy: userId, ...editPollDto },
    });
    
        if (!updatedPoll.isPublic) {
            await this.prisma.pollAllowedUsers.create({
                data: {
                    pollId: updatedPoll.id,
                    userId: userId
                }
            });
        }
    return { message: 'Poll updated successfully', poll: updatedPoll };
  } catch (error) {
    this.logger.error(`Error editing poll with id: ${pollId} by user: ${userId} - ${error.message}`);
    throw error;
  }
}

}
