import { Module } from '@nestjs/common';
// Importa o módulo responsável por permitir
// requisições HTTP para serviços externos.
import { HttpModule } from '@nestjs/axios';
import { LocalizacaoController } from './localizacao.controller';
import { LocalizacaoService } from './localizacao.service';

@Module({
  // Disponibiliza o HttpService dentro deste módulo.
  imports: [HttpModule],
  controllers: [LocalizacaoController],
  providers: [LocalizacaoService],
})
export class LocalizacaoModule {}