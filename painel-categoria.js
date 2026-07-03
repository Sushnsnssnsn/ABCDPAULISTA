if (!getLoginABCD()) location.href = 'login.html';

const staffParams = new URLSearchParams(window.location.search);
const areaAtual = staffParams.get('area') || 'formularios';
const tipoAtual = staffParams.get('tipo') || 'armas';
let orgs = [];
let formularios = [];

const tituloPagina = document.getElementById('staffOpcaoTitulo');
const areaAlterar = document.getElementById('areaAlterar');
const areaFormularios = document.getElementById('areaFormularios');
const areaCriar = document.getElementById('areaCriar');
const areaControle = document.getElementById('areaControle');

const livreCategoria = document.getElementById('livreCategoria');
const livreOrgaoBox = document.getElementById('livreOrgaoBox');
const livreOrgao = document.getElementById('livreOrgao');
const livreDivisao = document.getElementById('livreDivisao');
const choicePreview = document.getElementById('choicePreview');
const criarTipo = document.getElementById('criarTipo');
const criarDivisoesBox = document.getElementById('criarDivisoesBox');

function nomeVisivelOrg(o){
  const nome = String(o.nome || '');
  const tipo = String(o.tipo || '').toUpperCase();
  if (tipo === 'GCM' && nome.toUpperCase() === 'TRÂNSITO') return 'Ronda Cidadã';
  if (tipo === 'GCM' && nome.toUpperCase() === 'TRANSITO') return 'Ronda Cidadã';
  return nome;
}

function categoriaDaOrg(o){
  const cat = String(o.categoria || '').toUpperCase();
  const tipo = String(o.tipo || '').toUpperCase();
  if (cat === 'FAC' && tipo.includes('ARMA')) return 'armas';
  if (cat === 'FAC' && tipo.includes('MUNI')) return 'municoes';
  return 'orgs';
}

function chaveCategoriaFormulario(f){
  const org = f.orgs || {};
  const cat = String(org.categoria || '').toUpperCase();
  const tipo = String(org.tipo || '').toUpperCase();
  if (cat === 'FAC' && tipo.includes('ARMA')) return 'armas';
  if (cat === 'FAC' && tipo.includes('MUNI')) return 'municoes';
  if (cat === 'ORG') return 'orgs';
  return 'sem';
}

function nomeFiltro(chave){
  if (chave === 'armas') return 'FAC de Armas';
  if (chave === 'municoes') return 'FAC de Munições';
  if (chave === 'orgs') return 'ORGs / Órgãos Públicos';
  if (chave === 'sem') return 'Sem categoria';
  return 'Selecionado';
}

function aplicarArea(){
  areaAlterar.style.display = areaAtual === 'alterar' ? 'block' : 'none';
  areaFormularios.style.display = areaAtual === 'formularios' ? 'block' : 'none';
  areaCriar.style.display = areaAtual === 'criar' ? 'block' : 'none';
  areaControle.style.display = areaAtual === 'controle' ? 'block' : 'none';

  const titulos = {
    alterar: `Alterar vagas — ${nomeFiltro(tipoAtual)}`,
    formularios: `Formulários — ${nomeFiltro(tipoAtual)}`,
    criar: 'Criar FAC/ORG',
    controle: 'Controle geral'
  };
  tituloPagina.textContent = titulos[areaAtual] || 'Painel Staff';

  document.querySelectorAll('[data-area-filter]').forEach(el => {
    el.classList.toggle('active', el.dataset.areaFilter === tipoAtual);
  });
}

function selecionadas(){
  const cat = livreCategoria.value;
  if (cat === 'orgs') {
    return orgs.filter(o => categoriaDaOrg(o) === 'orgs' && o.tipo === livreOrgao.value);
  }
  return orgs.filter(o => categoriaDaOrg(o) === cat);
}

function orgSelecionada(){
  return orgs.find(o => o.id === livreDivisao.value);
}

function atualizarSeletoresAlterar(){
  livreCategoria.value = ['armas', 'municoes', 'orgs'].includes(tipoAtual) ? tipoAtual : 'armas';
  const cat = livreCategoria.value;
  livreDivisao.innerHTML = '';

  if (cat === 'orgs') {
    livreOrgaoBox.style.display = 'grid';
    const maes = [...new Set(orgs.filter(o => categoriaDaOrg(o) === 'orgs').map(o => o.tipo))].sort();
    livreOrgao.innerHTML = maes.map(m => `<option value="${m}">${m}</option>`).join('');
  } else {
    livreOrgaoBox.style.display = 'none';
  }
  atualizarDivisoesOrgao();
}

function atualizarDivisoesOrgao(){
  const lista = selecionadas();
  livreDivisao.innerHTML = lista.map(o => `<option value="${o.id}">${o.tipo} - ${nomeVisivelOrg(o)} (${o.status})</option>`).join('');
  const sel = orgSelecionada();
  choicePreview.textContent = sel ? `Selecionado: ${sel.tipo} - ${nomeVisivelOrg(sel)} (${sel.status})` : 'Nenhuma opção cadastrada nessa categoria.';
  renderLivres();
}

function tituloAlterarAtual(){
  const cat = livreCategoria.value;
  if (cat === 'armas') return 'FAC ARMAS';
  if (cat === 'municoes') return 'FAC MUNIÇÕES';
  return livreOrgao.value || 'ÓRGÃOS PÚBLICOS';
}

function renderLivres(){
  const box = document.getElementById('listasLivres');
  if (!box) return;
  box.innerHTML = '';
  const lista = selecionadas();
  if (!lista.length) {
    box.innerHTML = '<p class="empty">Nenhuma opção nessa categoria.</p>';
    return;
  }
  const card = document.createElement('div');
  card.className = 'request-card page-fade';
  card.innerHTML = `<strong>${tituloAlterarAtual()}</strong><p>${lista.map(o => `${nomeVisivelOrg(o)} (${o.status})`).join(' • ')}</p>`;
  box.appendChild(card);
}

function montarCardFormulario(f){
  const orgTitulo = f.orgs ? `${f.orgs.tipo} - ${nomeVisivelOrg(f.orgs)}` : 'ORG';
  return `
    <div class="request-card page-fade form-card">
      <strong>${orgTitulo} — ${f.nome_grupo}</strong>
      <p><b>Status:</b> ${f.status} • <b>Membros:</b> ${f.quantidade_membros} • <b>Enviado:</b> ${new Date(f.created_at).toLocaleString('pt-BR')}</p>
      <p><b>Líder:</b> ${f.nome_completo} • <b>Account ID:</b> ${f.account_id} • <b>Discord ID:</b> ${f.discord_id}</p>
      <p><b>Nascimento:</b> ${f.data_nascimento} • <b>Steam Hex:</b> ${f.steam_hex}</p>
      <p><b>História:</b> ${f.historia}</p>
      <p><b>Info líder:</b> ${f.lider_info}</p>
      <div class="mini-actions">
        <button onclick="mudarStatusForm('${f.id}', 'aprovado')">Aprovar</button>
        <button onclick="mudarStatusForm('${f.id}', 'reprovado')">Recusar</button>
        <button onclick="mudarStatusForm('${f.id}', 'pendente')">Pendente</button>
        <button class="danger" onclick="apagarFormulario('${f.id}')">Apagar</button>
      </div>
    </div>
  `;
}

function renderFormularios(){
  const box = document.getElementById('formulariosBox');
  if (!box) return;
  const lista = formularios.filter(f => chaveCategoriaFormulario(f) === tipoAtual);
  if (!lista.length) {
    box.innerHTML = `<p class="empty">Nenhum formulário em ${nomeFiltro(tipoAtual)}.</p>`;
    return;
  }
  box.innerHTML = `
    <div class="form-category-block page-fade">
      <div class="form-category-head"><h4>${nomeFiltro(tipoAtual)}</h4><span>${lista.length} formulário${lista.length > 1 ? 's' : ''}</span></div>
      <div class="form-category-list">${lista.map(montarCardFormulario).join('')}</div>
    </div>
  `;
}

function renderControle(){
  const box = document.getElementById('controleBox');
  if (!box) return;
  const aprovadas = formularios.filter(x => x.status === 'aprovado');
  const pendentes = formularios.filter(x => x.status === 'pendente');
  const livres = orgs.filter(x => x.status === 'livre').length;
  const privadas = orgs.filter(x => x.status === 'privada').length;
  box.innerHTML = `
    <div class="org-card">${orgs.length}<br><small>fac/org cadastradas</small></div>
    <div class="org-card">${livres}<br><small>livres</small></div>
    <div class="org-card">${privadas}<br><small>privadas</small></div>
    <div class="org-card">${formularios.length}<br><small>formulários</small></div>
    <div class="org-card">${aprovadas.length}<br><small>aprovadas</small></div>
    <div class="org-card">${pendentes.length}<br><small>pendentes</small></div>
  `;
}

async function carregarPainel(){
  try {
    orgs = await api('/api/orgs');
    formularios = await api('/api/formularios');
    if (areaAtual === 'alterar') atualizarSeletoresAlterar();
    if (areaAtual === 'formularios') renderFormularios();
    if (areaAtual === 'controle') renderControle();
  } catch (err) {
    if (String(err.message).includes('Login')) location.href = 'login.html';
    else alert(err.message);
  }
}

window.mudarStatusForm = async function(id, status){
  await api(`/api/formularios/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  await carregarPainel();
};

window.apagarFormulario = async function(id){
  if (!confirm('Tem certeza que deseja apagar este formulário?')) return;
  await api(`/api/formularios/${id}`, { method: 'DELETE' });
  await carregarPainel();
};

if (livreCategoria) livreCategoria.addEventListener('change', () => {
  const url = new URL(location.href);
  url.searchParams.set('tipo', livreCategoria.value);
  location.href = url.toString();
});
if (livreOrgao) livreOrgao.addEventListener('change', atualizarDivisoesOrgao);
if (livreDivisao) livreDivisao.addEventListener('change', () => {
  const sel = orgSelecionada();
  choicePreview.textContent = sel ? `Selecionado: ${sel.tipo} - ${nomeVisivelOrg(sel)} (${sel.status})` : 'Selecione uma opção.';
});

const livresForm = document.getElementById('livresForm');
if (livresForm) {
  Array.from(document.querySelectorAll('#livresForm button[type="submit"]')).forEach(btn => {
    btn.addEventListener('click', () => livresForm.dataset.status = btn.dataset.status);
  });
  livresForm.addEventListener('submit', async e => {
    e.preventDefault();
    const id = livreDivisao.value;
    const status = e.currentTarget.dataset.status || 'livre';
    if (!id) return alert('Selecione uma FAC/ORG.');
    await api(`/api/orgs/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await carregarPainel();
  });
}

if (criarTipo) criarTipo.addEventListener('change', () => {
  criarDivisoesBox.style.display = criarTipo.value.startsWith('org_') ? 'grid' : 'none';
});

const criarForm = document.getElementById('criarForm');
if (criarForm) criarForm.addEventListener('submit', async e => {
  e.preventDefault();
  const tipo = criarTipo.value;
  const nome = document.getElementById('criarNome').value.trim();
  const msg = document.getElementById('criarMsg');
  let categoria = 'FAC';
  let tipoBanco = 'ARMAS';
  if (tipo === 'fac_municoes') tipoBanco = 'MUNIÇÕES';
  if (tipo === 'org_militar') { categoria = 'ORG'; tipoBanco = nome; }
  if (tipo === 'org_pacifica') { categoria = 'ORG'; tipoBanco = nome; }
  try {
    if (tipo.startsWith('org_')) {
      const divsRaw = document.getElementById('criarDivisoes').value.trim();
      const divs = divsRaw ? divsRaw.split(',').map(x => x.trim()).filter(Boolean) : ['Geral'];
      for (const divisao of divs) {
        await api('/api/orgs', { method: 'POST', body: JSON.stringify({ categoria, tipo: tipoBanco, nome: divisao, status: 'livre' }) });
      }
    } else {
      await api('/api/orgs', { method: 'POST', body: JSON.stringify({ categoria, tipo: tipoBanco, nome: nome.toUpperCase(), status: 'livre' }) });
    }
    e.target.reset();
    criarDivisoesBox.style.display = 'none';
    msg.textContent = 'Criado no sistema com sucesso.';
    msg.style.color = '#35ff7c';
    await carregarPainel();
  } catch (err) {
    msg.textContent = err.message;
    msg.style.color = '#ff6969';
  }
});

if (criarDivisoesBox) criarDivisoesBox.style.display = 'none';
aplicarArea();
carregarPainel();
setInterval(carregarPainel, 10000);
