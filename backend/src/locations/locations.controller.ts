import { Controller, Get, UseGuards, Version } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Cache } from '../cache/decorators/cache.decorator';

@Controller({ path: 'locations', version: '1' })
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @UseGuards(JwtAuthGuard)
  @Cache(600, 'locations') // Cache for 10 minutes
  @Get()
  findAll() {
    return this.locationsService.findAll();
  }
}