import { Test, TestingModule } from '@nestjs/testing';
import { LocalizacaoController } from './localizacao.controller';

describe('LocalizacaoController', () => {
  let controller: LocalizacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalizacaoController],
    }).compile();

    controller = module.get<LocalizacaoController>(LocalizacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
