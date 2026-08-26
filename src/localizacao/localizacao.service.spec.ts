import { Test, TestingModule } from '@nestjs/testing';
import { LocalizacaoService } from './localizacao.service';

describe('LocalizacaoService', () => {
  let service: LocalizacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalizacaoService],
    }).compile();

    service = module.get<LocalizacaoService>(LocalizacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
