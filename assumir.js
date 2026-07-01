const dadosBase = {
  armas: {
    titulo: 'FAC: ARMAS disponíveis',
    badge: 'Armas',
    itens: ['GUAIANASES', 'TIRADENTES']
  },
  municoes: {
    titulo: 'FAC: MUNIÇÕES disponíveis',
    badge: 'Munições',
    itens: ['SILVINA', 'GRAJAU', 'ITAQUERA', 'HELIÓPOLIS']
  },
  orgs: {
    titulo: 'ORGS públicas disponíveis',
    badge: 'Orgs',
    orgs: {
      'PMESP': ['ROTA', 'BAEP', 'Força Tática', 'ROCAM', 'CavPM', 'COE', 'GATE', 'CPTran', 'Polícia Rodoviária', 'Polícia Ambiental', 'Corpo de Bombeiros'],
      'PCESP': ['DEIC', 'DHPP', 'DENARC', 'DECAP', 'DEMACRO', 'DIG', 'DISE', 'Delegacia Seccional', 'Delegacia da Mulher'],
      'GCM': ['ROMU', 'Canil', 'Ronda Escolar', 'GCM Ambiental', 'GCM Trânsito', 'Patrulhamento Preventivo', 'Defesa Civil'],
      'Polícia Federal': ['COT', 'GPI', 'NEPOM', 'Delegacia de Imigração', 'Repressão a Drogas', 'Crimes Cibernéticos'],
      'Exército Brasileiro': ['Infantaria', 'Cavalaria', 'Artilharia', 'Comunicações', 'Polícia do Exército'],
      'PRF': ['Grupo Tático', 'Núcleo de Operações Especiais', 'Motopoliciamento', 'Operações Rodoviárias'],
      'Receita Federal': ['Fiscalização Aduaneira', 'Repressão ao Contrabando', 'Controle de Mercadorias'],
      'Trânsito': ['CET', 'Agentes de Trânsito', 'Fiscalização Viária']
    }
  }
};

function carregarDados(){
  const editados = JSON.parse(localStorage.getItem('facorgABCD') || '{}');
  return {
    armas: {...dadosBase.armas, itens: editados.armas || dadosBase.armas.itens},
    municoes: {...dadosBase.municoes, itens: editados.municoes || dadosBase.municoes.itens},
    orgs: {...dadosBase.orgs, orgs: editados.orgsDetalhadas || dadosBase.orgs.orgs}
  };
}

let dados = carregarDados();
const params = new URLSearchParams(window.location.search);
const tipoSelect = document.getElementById('tipo');
const orgMaeBox = document.getElementById('orgMaeBox');
const orgMaeSelect = document.getElementById('orgMae');
const orgSelect = document.getElementById('organizacao');
const lista = document.getElementById('listaDisponiveis');
const titulo = document.getElementById('categoriaTitulo');
const badge = document.getElementById('categoriaBadge');
const pageTitle = document.getElementById('pageTitle');
const form = document.getElementById('assumirForm');
const formMsg = document.getElementById('formMsg');
const tabs = document.querySelectorAll('.tab-btn');

function listarOrgsNaTela(){
  lista.innerHTML = '';
  Object.entries(dados.orgs.orgs).forEach(([org, divisoes]) => {
    const div = document.createElement('div');
    div.className = 'request-card page-fade';
    div.innerHTML = `<strong>${org}</strong><p>${divisoes.join(' • ')}</p>`;
    lista.appendChild(div);
  });
}

function preencherDivisoesOrg(){
  const org = orgMaeSelect.value;
  const divisoes = dados.orgs.orgs[org] || [];
  orgSelect.innerHTML = '';
  divisoes.forEach(nome => {
    const opt = document.createElement('option');
    opt.value = `${org} - ${nome}`;
    opt.textContent = nome;
    orgSelect.appendChild(opt);
  });
}

function setTipo(tipo){
  dados = carregarDados();
  const atual = dados[tipo] ? tipo : 'armas';
  tipoSelect.value = atual;
  const info = dados[atual];
  titulo.textContent = info.titulo;
  badge.textContent = info.badge;
  pageTitle.textContent = atual === 'armas' ? 'Assumir FAC Armas' : atual === 'municoes' ? 'Assumir FAC Munições' : 'Assumir Org Pública';
  lista.innerHTML = '';
  orgSelect.innerHTML = '';

  if (atual === 'orgs') {
    orgMaeBox.style.display = 'block';
    orgMaeSelect.innerHTML = '';
    Object.keys(info.orgs).forEach(nome => {
      const opt = document.createElement('option');
      opt.value = nome;
      opt.textContent = nome;
      orgMaeSelect.appendChild(opt);
    });
    listarOrgsNaTela();
    preencherDivisoesOrg();
  } else {
    orgMaeBox.style.display = 'none';
    if (!info.itens.length) lista.innerHTML = '<p class="empty">Nenhuma vaga livre cadastrada no momento.</p>';
    info.itens.forEach(nome => {
      const div = document.createElement('div');
      div.className = 'item free page-fade';
      div.innerHTML = `<span></span> ${nome}`;
      lista.appendChild(div);
      const opt = document.createElement('option');
      opt.value = nome;
      opt.textContent = nome;
      orgSelect.appendChild(opt);
    });
  }

  tabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tipo === atual));
}

function salvarSolicitacao(solicitacao){
  const salvas = JSON.parse(localStorage.getItem('solicitacoesABCD') || '[]');
  salvas.unshift(solicitacao);
  localStorage.setItem('solicitacoesABCD', JSON.stringify(salvas));
}

tabs.forEach(btn => btn.addEventListener('click', () => setTipo(btn.dataset.tipo)));
tipoSelect.addEventListener('change', () => setTipo(tipoSelect.value));
orgMaeSelect.addEventListener('change', preencherDivisoesOrg);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const membros = Number(document.getElementById('membros').value);
  if (membros < 15) {
    formMsg.textContent = 'Para assumir FAC/ORG precisa ter no mínimo 15 pessoas.';
    formMsg.style.color = '#ff6969';
    return;
  }

  const solicitacao = {
    grupoNome: document.getElementById('grupoNome').value.trim(),
    historia: document.getElementById('historia').value.trim(),
    membros,
    liderInfo: document.getElementById('liderInfo').value.trim(),
    accountId: document.getElementById('accountId').value.trim(),
    nomeCompleto: document.getElementById('nomeCompleto').value.trim(),
    nascimento: document.getElementById('nascimento').value,
    discordId: document.getElementById('discordId').value.trim(),
    steamHex: document.getElementById('steamHex').value.trim(),
    tipo: tipoSelect.value,
    orgPrincipal: tipoSelect.value === 'orgs' ? orgMaeSelect.value : '',
    organizacao: orgSelect.value,
    status: 'Pendente',
    data: new Date().toLocaleString('pt-BR')
  };

  salvarSolicitacao(solicitacao);
  form.reset();
  setTipo(solicitacao.tipo);
  formMsg.textContent = 'Formulário enviado. A staff pode ver no PAINEL-STAFF.';
  formMsg.style.color = '#35ff7c';
});

setTipo(params.get('tipo') || 'armas');
