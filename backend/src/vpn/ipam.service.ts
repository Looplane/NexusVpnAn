import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IpAssignment } from './entities/ip-assignment.entity';

@Injectable()
export class IpamService {
  constructor(
    @InjectRepository(IpAssignment)
    private ipRepo: Repository<IpAssignment>,
  ) {}

  async assignIp(serverId: string, userId: string): Promise<string> {
    // Simple strategy: 10.100.0.x/24
    // Find all used IPs for this server
    const assignments = await this.ipRepo.find({ where: { serverId } });
    const usedOctets = new Set(assignments.map(a => parseInt(a.ipAddress.split('.')[3])));

    // Find first free octet starting from 2 (1 is gateway)
    let octet = 2;
    while (usedOctets.has(octet)) {
      octet++;
      if (octet > 254) throw new Error('Subnet exhausted for this server');
    }

    const ip = `10.100.0.${octet}`;
    
    // Reserve it
    const assignment = this.ipRepo.create({
      ipAddress: ip,
      serverId,
      userId,
    });
    await this.ipRepo.save(assignment);

    return `${ip}/32`;
  }
}