import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { afterEach, beforeEach, describe, it } from 'node:test';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    } catch (error) {
      console.error('Error during test setup:', error);
      throw error;
    }
  });

  afterEach(async () => {
    try {
      await app.close();
    } catch (error) {
      console.error('Error during test cleanup:', error);
      throw error;
    }
  });

  it('/ (GET) returns 404 when no root route is defined', async () => {
    await request(app.getHttpServer()).get('/').expect(404);
  });
});
