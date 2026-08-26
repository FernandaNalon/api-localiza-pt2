// =====================================================
// CONFIGURAÇÃO INICIAL DO MAPA
// =====================================================

// Define uma posição inicial para o mapa.
//
// Estamos começando aproximadamente no Brasil.
const mapa = L.map('mapa').setView([-14.235, -51.9253], 4);

// Adiciona as imagens do mapa utilizando OpenStreetMap.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(mapa);

// Variável que armazenará o marcador atual.
//
// Dessa forma conseguimos remover o marcador anterior
// antes de adicionar um novo.
let marcador;

// =====================================================
// ELEMENTOS DO HTML
// =====================================================

const inputCep = document.getElementById('cep');

const btnBuscar = document.getElementById('btnBuscar');

const btnLocalizacao = document.getElementById('btnLocalizacao');

const mensagem = document.getElementById('mensagem');

// =====================================================
// BUSCAR CEP
// =====================================================

btnBuscar.addEventListener('click', async () => {
  const cep = inputCep.value.trim();

  mensagem.textContent = '';

  if (!cep) {
    mensagem.textContent = 'Informe um CEP.';

    return;
  }

  try {
    // Nossa aplicação Front-End não consulta
    // diretamente o ViaCEP.
    //
    // Ela consulta a NOSSA API.
    const resposta = await fetch(
      `http://localhost:3000/localizacao/cep/${cep}/coordenadas`,
    );

    // Converte a resposta para JSON.
    const dados = await resposta.json();

    // Se a API retornar erro HTTP,
    // por exemplo 400 ou 404.
    if (!resposta.ok) {
      throw new Error(dados.message || 'Não foi possível realizar a consulta.');
    }

    // Mostra os dados na tela.
    preencherInformacoes(dados);

    // Atualiza o mapa.
    atualizarMapa(
      dados.latitude,
      dados.longitude,
      `${dados.logradouro} - ${dados.cidade}`,
    );
  } catch (erro) {
    mensagem.textContent = erro.message;
  }
});

// =====================================================
// PREENCHER INFORMAÇÕES NA TELA
// =====================================================

function preencherInformacoes(dados) {
  document.getElementById('resultadoCep').textContent = dados.cep || '-';

  document.getElementById('logradouro').textContent = dados.logradouro || '-';

  document.getElementById('bairro').textContent = dados.bairro || '-';

  document.getElementById('cidade').textContent = dados.cidade || '-';

  document.getElementById('estado').textContent = dados.estado || '-';

  document.getElementById('latitude').textContent = dados.latitude;

  document.getElementById('longitude').textContent = dados.longitude;
}

// =====================================================
// ATUALIZAR O MAPA
// =====================================================

function atualizarMapa(latitude, longitude, textoMarcador) {
  // Centraliza o mapa na localização.
  mapa.setView([latitude, longitude], 15);

  // Se já existir um marcador,
  // removemos antes de criar outro.
  if (marcador) {
    mapa.removeLayer(marcador);
  }

  // Cria o novo marcador.
  marcador = L.marker([latitude, longitude])
    .addTo(mapa)
    .bindPopup(textoMarcador)
    .openPopup();
}

// =====================================================
// LOCALIZAÇÃO ATUAL
// =====================================================

btnLocalizacao.addEventListener('click', () => {
  mensagem.textContent = '';

  // Primeiro verificamos se o navegador
  // possui suporte à Geolocation API.
  if (!navigator.geolocation) {
    mensagem.textContent = 'Seu navegador não possui suporte à geolocalização.';

    return;
  }

  // Solicita a localização atual.
  navigator.geolocation.getCurrentPosition(
    // =================================================
    // SUCESSO
    // =================================================

    (posicao) => {
      const latitude = posicao.coords.latitude;

      const longitude = posicao.coords.longitude;

      // Mostramos as coordenadas na tela.
      document.getElementById('latitude').textContent = latitude;

      document.getElementById('longitude').textContent = longitude;

      // Como aqui não pesquisamos um CEP,
      // limpamos os campos de endereço.
      document.getElementById('resultadoCep').textContent = '-';

      document.getElementById('logradouro').textContent = '-';

      document.getElementById('bairro').textContent = '-';

      document.getElementById('cidade').textContent = '-';

      document.getElementById('estado').textContent = '-';

      // Atualiza o mapa.
      atualizarMapa(latitude, longitude, 'Minha localização');
    },

    // =================================================
    // ERRO
    // =================================================

    (erro) => {
      if (erro.code === 1) {
        mensagem.textContent = 'Permissão de localização negada.';
      } else {
        mensagem.textContent = 'Não foi possível obter sua localização.';
      }
    },
  );
});
