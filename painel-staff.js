if (!getLoginABCD()) location.href = 'login.html';

let orgs = [];
let formularios = [];

const livreCategoria = document.getElementById('livreCategoria');
const livreOrgaoBox = document.getElementById('livreOrgaoBox');
const livreOrgao = document.getElementById('livreOrgao');
const livreDivisao = document.getElementById('livreDivisao');
const choicePreview = document.getElementById('choicePreview');
const criarTipo = document.getElementById('criarTipo');
const criarDivisoesBox = document.getElementById('criarDivisoesBox');

function categoriaDaOrg(o){
  const cat = String(o.categoria || '').toUpperCase();
  const tipo = String(o.tipo || '').toUpperCase();
  if (cat === 'FAC' && tipo.includes('ARMA')) return 'armas';
  if (cat === 'FAC' && tipo.includes('MUNI')) return 'municoes';
  return 'orgs';
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

  livreDivisao.innerHTML = lista
    .map(o => `<option value="${o.id}">${o.tipo} - ${o.nome} (${o.status})</option>`)
    .join('');

  const sel = orgSelecionada();
  choicePreview.textContent = sel
    ? `Selecionado: ${sel.tipo} - ${sel.nome} (${sel.status})`
    : 'Nenhuma opção cadastrada nessa categoria.';
}

function renderLivres(){
  const box = document.getElementById('listasLivres');
  box.innerHTML = '';

  const grupos = {};
  orgs.forEach(o => {
    const k = categoriaDaOrg(o) === 'orgs'
      ? o.tipo
      : (categoriaDaOrg(o) === 'armas' ? 'FAC ARMAS' : 'FAC MUNIÇÕES');

    (grupos[k] ||= []).push(o);
  });

  Object.entries(grupos).forEach(([nome, lista]) => {
    const card = document.createElement('div');
    card.className = 'request-card page-fade';
    card.innerHTML = `
      <strong>${nome}</strong>
      <p>${lista.map(o => `${o.nome} (${o.status})`).join(' • ')}</p>
    `;
    box.appendChild(card);
  });
}

function renderFormularios(){
  const box = document.getElementById('formulariosBox');
  box.innerHTML = '';

  if (!formularios.length){
    box.innerHTML = '<p class="empty">Nenhum formulário enviado ainda.</p>';
    return;
  }

  formularios.forEach((f) => {
    const card = document.createElement('div');
    card.className = 'request-card page-fade';

    card.innerHTML = `
      <strong>${f.orgs ? `${f.orgs.tipo} - ${f.orgs.nome}` : 'ORG'} — ${f.nome_grupo}</strong>

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
    `;

    box.appendChild(card);
  });
}

function renderControle(){
  const aprovadas = formularios.filter(x => x.status === 'aprovado');
  const pendentes = formularios.filter(x => x.status === 'pendente');
  const livres = orgs.filter(x => x.status === 'livre').length;
  const privadas = orgs.filter(x => x.status === 'privada').length;

  const box = document.getElementById('controleBox');
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

    atualizarSeletoresAlterar();
    renderLivres();
    renderFormularios();
    renderControle();
  } catch (err) {
    if (String(err.message).includes('Login')) {
      location.href = 'login.html';
    } else {
      alert(err.message);
    }
  }
}

window.mudarStatusForm = async function(id, status){
  await api(`/api/formularios/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });

  await carregarPainel();
};

window.apagarFormulario = async function(id){
  if (!confirm('Tem certeza que deseja apagar este formulário?')) return;

  await api(`/api/formularios/${id}`, {
    method: 'DELETE'
  });

  await carregarPainel();
};

livreCategoria.addEventListener('change', atualizarSeletoresAlterar);
livreOrgao.addEventListener('change', atualizarDivisoesOrgao);

livreDivisao.addEventListener('change', () => {
  const sel = orgSelecionada();
  choicePreview.textContent = sel
    ? `Selecionado: ${sel.tipo} - ${sel.nome} (${sel.status})`
    : 'Selecione uma opção.';
});

Array.from(document.querySelectorAll('#livresForm button[type="submit"]')).forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('livresForm').dataset.status = btn.dataset.status;
  });
});

document.getElementById('livresForm').addEventListener('submit', async e => {
  e.preventDefault();

  const id = livreDivisao.value;
  const status = e.currentTarget.dataset.status || 'livre';

  if (!id) return alert('Selecione uma FAC/ORG.');

  await api(`/api/orgs/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });

  await carregarPainel();
});

document.getElementById('limparLivres').addEventListener('click', async () => {
  alert('Reset padrão agora é feito direto no Supabase. Use alterar livre/privada ou criar nova FAC/ORG.');
});

criarTipo.addEventListener('change', () => {
  criarDivisoesBox.style.display = criarTipo.value.startsWith('org_') ? 'grid' : 'none';
});

document.getElementById('criarForm').addEventListener('submit', async e => {
  e.preventDefault();

  const tipo = criarTipo.value;
  const nome = document.getElementById('criarNome').value.trim();
  const msg = document.getElementById('criarMsg');

  let categoria = 'FAC';
  let tipoBanco = 'ARMAS';

  if (tipo === 'fac_municoes') tipoBanco = 'MUNIÇÕES';
  if (tipo === 'org_militar') {
    categoria = 'ORG';
    tipoBanco = nome;
  }
  if (tipo === 'org_pacifica') {
    categoria = 'ORG';
    tipoBanco = nome;
  }

  try {
    if (tipo.startsWith('org_')) {
      const divsRaw = document.getElementById('criarDivisoes').value.trim();
      const divs = divsRaw
        ? divsRaw.split(',').map(x => x.trim()).filter(Boolean)
        : ['Geral'];

      for (const divisao of divs) {
        await api('/api/orgs', {
          method: 'POST',
          body: JSON.stringify({
            categoria,
            tipo: tipoBanco,
            nome: divisao,
            status: 'livre'
          })
        });
      }
    } else {
      await api('/api/orgs', {
        method: 'POST',
        body: JSON.stringify({
          categoria,
          tipo: tipoBanco,
          nome: nome.toUpperCase(),
          status: 'livre'
        })
      });
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

criarDivisoesBox.style.display = 'none';
carregarPainel();
setInterval(carregarPainel, 10000);
window.apagarFormulario = async function(id){
  alert("Clicou para apagar: " + id);

  if (!confirm("Tem certeza que deseja apagar este formulário?")) return;

  await api(`/api/formularios/${id}`, {
    method: "DELETE"
  });

  await carregarPainel();
};
