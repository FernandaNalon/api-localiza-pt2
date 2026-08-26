import { Module } from '@nestjs/common';
import { LocalizacaoModule } from './localizacao/localizacao.module';

@Module({
  imports: [LocalizacaoModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
