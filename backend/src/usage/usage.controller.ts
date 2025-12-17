import { Controller, Get, UseGuards, Request, Version } from '@nestjs/common';
import { UsageService } from './usage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller({ path: 'usage', version: '1' })
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getUsageHistory(@Request() req) {
    const records = await this.usageService.getUserUsage(req.user.userId);
    
    // Aggregate total for the current billing period (simplified to last 30 days)
    let totalUp = BigInt(0);
    let totalDown = BigInt(0);
    
    records.forEach(r => {
      totalUp += BigInt(r.bytesUploaded);
      totalDown += BigInt(r.bytesDownloaded);
    });

    return {
      history: records,
      total: {
        up: totalUp.toString(),
        down: totalDown.toString(),
        combined: (totalUp + totalDown).toString()
      }
    };
  }
}