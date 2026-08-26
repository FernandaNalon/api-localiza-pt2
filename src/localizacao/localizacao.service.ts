import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
// O HttpService trabalha com Observable.
// O lastValueFrom transforma o Observable
// em uma Promise que podemos utilizar com await.
import { lastValueFrom } from 'rxjs';

@Injectable()
export class LocalizacaoService {
  // Injeta o HttpService no nosso service.
  constructor(private readonly httpService: HttpService) {}

  // =====================================================
  // CONSULTAR CEP
  // =====================================================
  async buscarCep(cep: string) {
    // Remove qualquer caractere que não seja número.
    // Exemplo:
    // 01001-000
    // se transforma em:
    // 01001000
    const cepLimpo = cep.replace(/\D/g, '');

    // O ViaCEP trabalha com CEP de exatamente 8 números.
    if (cepLimpo.length !== 8) {
      throw new BadRequestException('O CEP deve possuir 8 números.');
    }

    try {
      // Fazemos a requisição para a API externa.
      // O HttpService.get() retorna um Observable.
      // Por isso usamos lastValueFrom para conseguir
      // trabalhar com async/await.
      const resposta = await lastValueFrom(
        this.httpService.get(`https://viacep.com.br/ws/${cepLimpo}/json/`),
      );

      // O conteúdo retornado pela API fica dentro
      // da propriedade "data".
      const dados = resposta.data;

      // Quando o CEP possui 8 números, mas não existe,
      // o ViaCEP retorna:
      // {
      //   "erro": "true"
      // }
      if (dados.erro) {
        throw new NotFoundException('CEP não encontrado.');
      }

      // Não precisamos devolver absolutamente tudo
      // o que o ViaCEP retornou.
      // Nossa aplicação escolhe quais informações
      // serão disponibilizadas ao cliente.
      return {
        cep: dados.cep,
        logradouro: dados.logradouro,
        bairro: dados.bairro,
        cidade: dados.localidade,
        estado: dados.uf,
        regiao: dados.regiao,
      };
    } catch (erro) {
      // Se o erro foi criado pela própria aplicação,
      // por exemplo NotFoundException,
      // simplesmente repassamos.
      if (
        erro instanceof NotFoundException ||
        erro instanceof BadRequestException
      ) {
        throw erro;
      }

      // Caso a API externa esteja indisponível
      // ou ocorra algum problema de comunicação.
      throw new ServiceUnavailableException(
        'Não foi possível consultar o serviço de CEP.',
      );
    }
  }

  // =====================================================
  // CONSULTAR LOCALIZAÇÃO POR CIDADE
  // =====================================================

  async buscarCidade(cidade: string) {
    // Evita consultas vazias.
    if (!cidade || cidade.trim().length < 2) {
      throw new BadRequestException('Informe uma cidade válida.');
    }

    try {
      // encodeURIComponent prepara o texto para ser
      // utilizado dentro de uma URL.
      // Exemplo:
      // "São Paulo"
      // passa a ser enviado corretamente na URL.
      const cidadeCodificada = encodeURIComponent(cidade.trim());

      // Fazemos a consulta para a API de geocoding.
      // count=1: queremos somente o primeiro resultado.
      // language=pt: solicita nomes traduzidos para português
      // quando disponíveis.
      // countryCode=BR: restringe nossa consulta ao Brasil.
      const resposta = await lastValueFrom(
        this.httpService.get('https://geocoding-api.open-meteo.com/v1/search', {
          params: {
            name: cidade.trim(),
            count: 1,
            language: 'pt',
            countryCode: 'BR',
          },
        }),
      );

      const dados = resposta.data;

      // A API retorna os resultados dentro de:
      // results: [...]
      // Se não existir results ou estiver vazio,
      // significa que nenhuma cidade foi encontrada.
      if (!dados.results || dados.results.length === 0) {
        throw new NotFoundException('Localidade não encontrada.');
      }

      // Pegamos o primeiro resultado.
      const localizacao = dados.results[0];
      // Novamente, transformamos os dados.
      // A API externa possui muito mais propriedades,
      // mas nossa aplicação precisa apenas destas.
      return {
        cidade: localizacao.name,
        // admin1 normalmente representa o estado/região
        // administrativa principal.
        estado: localizacao.admin1,
        pais: localizacao.country,
        latitude: localizacao.latitude,
        longitude: localizacao.longitude,
      };
    } catch (erro) {
      if (
        erro instanceof NotFoundException ||
        erro instanceof BadRequestException
      ) {
        throw erro;
      }
      throw new ServiceUnavailableException(
        'Não foi possível consultar o serviço de localização.',
      );
    }
  }
  // ----------------------------
  // AULA 2
  // ----------------------------

  async buscarCepComCoordenadas(cep: string) {
    // Primeiro buscamos o endereço pelo CEP.
    const endereco = await this.buscarCep(cep);

    // Depois utilizamos a cidade retornada
    // para consultar latitude e longitude.
    const localizacao = await this.buscarCidade(endereco.cidade);

    // Montamos uma nova resposta.
    return {
      cep: endereco.cep,
      logradouro: endereco.logradouro,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      estado: endereco.estado,
      latitude: localizacao.latitude,
      longitude: localizacao.longitude,
    };
  }
}
