// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/auth/roles.guard';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (context: { switchToHttp: () => { (): any; new(): any; getRequest: { (): any; new(): any; }; }; }) => {
        const request = context.switchToHttp().getRequest();
        request.user = { id: 'test-user-id', role: 'organization' };
        return true;
      }
    })
    .overrideGuard(RolesGuard)
    .useValue({
      canActivate: () => true
    })
    .overrideProvider('VERIFICATION_SERVICE')
    .useValue({
      emit: jest.fn().mockImplementation(() => ({
        pipe: jest.fn(),
      })),
    })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('FundWise Campaign Service is running!');
  });
});
