import { Test, TestingModule } from '@nestjs/testing';
import { MlController } from './ml.controller';

describe('MlController', () => {
  let controller: MlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MlController],
    }).compile();

    controller = module.get<MlController>(MlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
