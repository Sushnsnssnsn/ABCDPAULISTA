if (!localStorage.getItem('loginABCD')) location.href = 'login.html';

const base = {
  armas: ['GUAIANASES','TIRADENTES'],
  municoes: ['SILVINA','GRAJAU','ITAQUERA','HELIÓPOLIS'],
  privadas: { armas: [], municoes: [], orgs: [] },
  orgsDetalhadas: {
    'PMESP': ['ROTA', 'BAEP', 'Força Tática', 'ROCAM', 'CavPM', 'COE', 'GATE', 'CPTran', 'Polícia Rodoviária', 'Polícia Ambiental', 'Corpo de Bombeiros'],
    'PCESP': ['DEIC', 'DHPP', 'DENARC', 'DECAP', 'DEMACRO', 'DIG', 'DISE', 'Delegacia Seccional', 'Delegacia da Mulher'],
    'GCM': ['ROMU', 'Canil', 'Ronda Escolar', 'GCM Ambiental', 'GCM Trânsito', 'Patrulhamento Preventivo', 'Defesa Civil'],
    'Polícia Federal': ['COT', 'GPI', 'NEPOM', 'Delegacia de Imigração', 'Repressão a Drogas', 'Crimes Cibernéticos'],
    'Exército Brasileiro': ['Infantaria', 'Cavalaria', 'Artilharia', 'Comunicações', 'Polícia do Exército'],
    'PRF': ['Grupo Tático', 'Núcleo de Operações Especiais', 'Motopoliciamento', 'Operações Rodoviárias'],
    'Receita Federal': ['Fiscalização Aduaneira', 'Repressão ao Contrabando', 'Controle de Mercadorias'],
    'Trânsito': ['CET', 'Agentes de Trânsito', 'Fiscalização Viária']
  }
};

function getLivres(){
  const salvo = JSON.parse(localStorage.getItem('facorgABCD') || '{}');
  return {
    armas: salvo.armas || base.armas,
    municoes: salvo.municoes || base.municoes,
    privadas: salvo.privadas || base.privadas,
    orgsDetalhadas: salvo.orgsDetalhadas || base.orgsDetalhadas
  };
}
function setLivres(d){ localStorage.setItem('facorgABCD', JSON.stringify(d)); }
function getSolicitacoes(){ return JSON.parse(localStorage.getItem('solicitacoesABCD') || '[]'); }
function setSolicitacoes(s){ localStorage.setItem('solicitacoesABCD', JSON.stringify(s)); }

const livreCategoria = document.getElementById('livreCategoria');
const livreOrgaoBox = document.getElementById('livreOrgaoBox');
const livreOrgao = document.getElementById('livreOrgao');
const livreDivisao = document.getElementById('livreDivisao');
const choicePreview = document.getElementById('choicePreview');
const criarTipo = document.getElementById('criarTipo');
const criarDivisoesBox = document.getElementById('criarDivisoesBox');

function selecionadoAtual(){
  const cat = livreCategoria.value;
  if (cat === 'orgs') return `${livreOrgao.value} - ${livreDivisao.value}`;
  return livreDivisao.value;
}

function atualizarSeletoresAlterar(){
  const d = getLivres();
  const cat = livreCategoria.value;
  livreDivisao.innerHTML = '';
  if (cat === 'orgs') {
    livreOrgaoBox.style.display = 'grid';
    livreOrgao.innerHTML = '';
    Object.keys(d.orgsDetalhadas).forEach(org => {
      const opt = document.createElement('option');
      opt.value = org; opt.textContent = org;
      livreOrgao.appendChild(opt);
    });
    atualizarDivisoesOrgao();
  } else {
    livreOrgaoBox.style.display = 'none';
    const lista = cat === 'armas' ? d.armas : d.municoes;
    lista.forEach(nome => {
      const opt = document.createElement('option');
      opt.value = nome; opt.textContent = nome;
      livreDivisao.appendChild(opt);
    });
    choicePreview.textContent = lista.length ? `Selecionado: ${selecionadoAtual()}` : 'Nenhuma opção cadastrada nessa categoria.';
  }
}

function atualizarDivisoesOrgao(){
  const d = getLivres();
  const divs = d.orgsDetalhadas[livreOrgao.value] || [];
  livreDivisao.innerHTML = '';
  divs.forEach(nome => {
    const opt = document.createElement('option');
    opt.value = nome; opt.textContent = nome;
    livreDivisao.appendChild(opt);
  });
  choicePreview.textContent = divs.length ? `Selecionado: ${selecionadoAtual()}` : 'Nenhuma divisão cadastrada nesse órgão.';
}

function renderLivres(){
  const d = getLivres();
  const box = document.getElementById('listasLivres');
  const privadas = d.privadas || base.privadas;
  box.innerHTML = '';

  const armas = document.createElement('div'); armas.className = 'request-card page-fade';
  armas.innerHTML = `<strong>FAC ARMAS LIVRES</strong><p>${d.armas.length ? d.armas.join(' • ') : 'Nenhuma vaga livre.'}</p><small>Privadas: ${(privadas.armas||[]).join(' • ') || 'nenhuma'}</small>`;
  box.appendChild(armas);

  const mun = document.createElement('div'); mun.className = 'request-card page-fade';
  mun.innerHTML = `<strong>FAC MUNIÇÕES LIVRES</strong><p>${d.municoes.length ? d.municoes.join(' • ') : 'Nenhuma vaga livre.'}</p><small>Privadas: ${(privadas.municoes||[]).join(' • ') || 'nenhuma'}</small>`;
  box.appendChild(mun);

  Object.entries(d.orgsDetalhadas).forEach(([org, divisoes]) => {
    const card = document.createElement('div');
    card.className = 'request-card page-fade';
    const privOrg = (privadas.orgs || []).filter(x => x.startsWith(org + ' - ')).map(x => x.replace(org + ' - ', ''));
    card.innerHTML = `<strong>${org} LIVRES</strong><p>${divisoes.length ? divisoes.join(' • ') : 'Nenhuma divisão livre.'}</p><small>Privadas: ${privOrg.join(' • ') || 'nenhuma'}</small>`;
    box.appendChild(card);
  });
}

function renderFormularios(){
  const s = getSolicitacoes();
  const box = document.getElementById('formulariosBox');
  box.innerHTML = '';
  if (!s.length){ box.innerHTML = '<p class="empty">Nenhum formulário enviado ainda.</p>'; return; }
  s.forEach((f, i) => {
    const card = document.createElement('div');
    card.className = 'request-card page-fade';
    card.innerHTML = `<strong>${f.organizacao} — ${f.grupoNome}</strong>
      <p><b>Status:</b> ${f.status || 'Pendente'} • <b>Membros:</b> ${f.membros} • <b>Enviado:</b> ${f.data}</p>
      <p><b>Líder:</b> ${f.nomeCompleto} • <b>Account ID:</b> ${f.accountId} • <b>Discord ID:</b> ${f.discordId}</p>
      <p><b>Nascimento:</b> ${f.nascimento} • <b>Steam Hex:</b> ${f.steamHex}</p>
      <p><b>História:</b> ${f.historia}</p>
      <p><b>Info líder:</b> ${f.liderInfo}</p>
      <div class="mini-actions"><button onclick="mudarStatus(${i}, 'Aprovado')">Aprovar</button><button onclick="mudarStatus(${i}, 'Recusado')">Recusar</button><button onclick="excluirForm(${i})">Excluir</button></div>`;
    box.appendChild(card);
  });
}

function renderControle(){
  const s = getSolicitacoes();
  const aprovadas = s.filter(x => x.status === 'Aprovado');
  const pendentes = s.filter(x => !x.status || x.status === 'Pendente');
  const box = document.getElementById('controleBox');
  box.innerHTML = `<div class="org-card">${s.length}<br><small>formulários</small></div><div class="org-card">${aprovadas.length}<br><small>assumidas</small></div><div class="org-card">${pendentes.length}<br><small>pendentes</small></div>`;
  aprovadas.forEach(a => { const div = document.createElement('div'); div.className='org-card'; div.innerHTML = `${a.organizacao}<br><small>${a.grupoNome}</small>`; box.appendChild(div); });
}

function addUnico(lista, nome){ if (nome && !lista.includes(nome)) lista.push(nome); }
function remover(lista, nome){ const i = lista.indexOf(nome); if (i >= 0) lista.splice(i, 1); }

window.mudarStatus = function(i, status){ const s = getSolicitacoes(); if(s[i]) s[i].status = status; setSolicitacoes(s); renderFormularios(); renderControle(); };
window.excluirForm = function(i){ const s = getSolicitacoes(); s.splice(i,1); setSolicitacoes(s); renderFormularios(); renderControle(); };

livreCategoria.addEventListener('change', atualizarSeletoresAlterar);
livreOrgao.addEventListener('change', atualizarDivisoesOrgao);
livreDivisao.addEventListener('change', () => choicePreview.textContent = `Selecionado: ${selecionadoAtual()}`);

Array.from(document.querySelectorAll('#livresForm button[type="submit"]')).forEach(btn => {
  btn.addEventListener('click', () => document.getElementById('livresForm').dataset.status = btn.dataset.status);
});

document.getElementById('livresForm').addEventListener('submit', e => {
  e.preventDefault();
  const d = getLivres();
  d.privadas = d.privadas || { armas: [], municoes: [], orgs: [] };
  const cat = livreCategoria.value;
  const status = e.currentTarget.dataset.status || 'livre';
  const nome = selecionadoAtual();
  if (!nome) return;

  if (cat === 'armas' || cat === 'municoes') {
    if (status === 'livre') { addUnico(d[cat], nome); remover(d.privadas[cat], nome); }
    else { addUnico(d.privadas[cat], nome); remover(d[cat], nome); }
  } else {
    const org = livreOrgao.value;
    const divisao = livreDivisao.value;
    if (!d.orgsDetalhadas[org]) d.orgsDetalhadas[org] = [];
    if (status === 'livre') { addUnico(d.orgsDetalhadas[org], divisao); remover(d.privadas.orgs, nome); }
    else { addUnico(d.privadas.orgs, nome); remover(d.orgsDetalhadas[org], divisao); }
  }
  setLivres(d);
  renderLivres();
  atualizarSeletoresAlterar();
});

document.getElementById('limparLivres').addEventListener('click', () => { setLivres(base); renderLivres(); atualizarSeletoresAlterar(); });

criarTipo.addEventListener('change', () => {
  criarDivisoesBox.style.display = criarTipo.value.startsWith('org_') ? 'grid' : 'none';
});

document.getElementById('criarForm').addEventListener('submit', e => {
  e.preventDefault();
  const d = getLivres();
  const tipo = criarTipo.value;
  const nome = document.getElementById('criarNome').value.trim();
  const msg = document.getElementById('criarMsg');
  if (!nome) return;

  if (tipo === 'fac_armas') addUnico(d.armas, nome.toUpperCase());
  if (tipo === 'fac_municoes') addUnico(d.municoes, nome.toUpperCase());
  if (tipo.startsWith('org_')) {
    const divsRaw = document.getElementById('criarDivisoes').value.trim();
    const divs = divsRaw ? divsRaw.split(',').map(x => x.trim()).filter(Boolean) : ['Geral'];
    d.orgsDetalhadas[nome] = divs;
  }
  setLivres(d);
  e.target.reset();
  criarDivisoesBox.style.display = 'none';
  msg.textContent = 'Criado no sistema com sucesso.';
  renderLivres();
  atualizarSeletoresAlterar();
});

criarDivisoesBox.style.display = 'none';
atualizarSeletoresAlterar(); renderLivres(); renderFormularios(); renderControle();
