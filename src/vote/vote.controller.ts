import { Controller, Param, UseGuards } from '@nestjs/common';
import { VoteService } from './vote.service';
import { Body, Post, Req} from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.gaurd';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { voteDto } from './dto/vote-dto';

@Controller('vote')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

 @UseGuards(JwtAuthGuard)
 @Post(':id')
  async vote(@Body() body: voteDto, @Param('id') id: string, @Req() req: any)
 {
  try {
    const vote = await this.voteService.createVote(id, req.user.id, body.optionId);
    return { message: 'Vote cast successfully', success: true };
  } catch (error) {
    throw error; // Let NestJS handle the BadRequestException properly
  }
}
}
