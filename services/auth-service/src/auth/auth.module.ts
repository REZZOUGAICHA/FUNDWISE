import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppService } from '../app.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AppController } from '../app.controller';
import { PinataService } from '../ipfs/pinata.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  exports: [JwtModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, PinataService],
})
export class AuthModule {}
