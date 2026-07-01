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
let todasOrgs = [];

function orgsLivres(){ return todasOrgs.filter(o => String(o.status).toLowerCase() === 'livre'); }
function categoriaDaOrg(o){
  const cat = String(o.categoria || '').toUpperCase();
  const tipo = String(o.tipo || '').toUpperCase();
  if (cat === 'FAC' && tipo.includes('ARMA')) return 'armas';
  if (cat === 'FAC' && tipo.includes('MUNI')) return 'municoes';
  return 'orgs';
}
function porTipo(tipo){ return orgsLivres().filter(o => categoriaDaOrg(o) === tipo); }

function preencherOrgsMae(listaOrgs){
  const maes = [...new Set(listaOrgs.map(o => o.tipo))].sort();
  orgMaeSelect.innerHTML = maes.map(m => `<option value="${m}">${m}</option>`).join('');
}
function preencherSelect(listaOrgs){
  orgSelect.innerHTML = '';
  listaOrgs.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.id;
    opt.textContent = `${o.tipo} - ${o.nome}`;
    orgSelect.appendChild(opt);
  });
}
function renderDisponiveis(listaOrgs){
  lista.innerHTML = '';
  if (!listaOrgs.length) {
    lista.innerHTML = '<p class="empty">Nenhuma vaga livre cadastrada no momento.</p>';
    return;
  }
  listaOrgs.forEach(o => {
    const div = document.createElement('div');
    div.className = 'item free page-fade';
    div.innerHTML = `<span></span> ${o.tipo} - ${o.nome}`;
    lista.appendChild(div);
  });
}
function setTipo(tipo){
  const atual = ['armas','municoes','orgs'].includes(tipo) ? tipo : 'armas';
  tipoSelect.value = atual;
  const nomes = { armas: ['FAC: ARMAS disponíveis', 'Armas', 'Assumir FAC Armas'], municoes: ['FAC: MUNIÇÕES disponíveis', 'Munições', 'Assumir FAC Munições'], orgs: ['ORGS públicas disponíveis', 'Orgs', 'Assumir Org Pública'] };
  titulo.textContent = nomes[atual][0]; badge.textContent = nomes[atual][1]; pageTitle.textContent = nomes[atual][2];
  const listaTipo = porTipo(atual);
  orgMaeBox.style.display = atual === 'orgs' ? 'block' : 'none';
  if (atual === 'orgs') {
    preencherOrgsMae(listaTipo);
    const filtradas = listaTipo.filter(o => o.tipo === orgMaeSelect.value);
    preencherSelect(filtradas);
    renderDisponiveis(listaTipo);
  } else {
    preencherSelect(listaTipo);
    renderDisponiveis(listaTipo);
  }
  tabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tipo === atual));
}
async function carregarOrgs(){
  try {
    todasOrgs = await api('/api/orgs');
    setTipo(params.get('tipo') || tipoSelect.value || 'armas');
  } catch (err) {
    lista.innerHTML = `<p class="empty">Erro ao carregar: ${err.message}</p>`;
  }
}

tabs.forEach(btn => btn.addEventListener('click', () => setTipo(btn.dataset.tipo)));
tipoSelect.addEventListener('change', () => setTipo(tipoSelect.value));
orgMaeSelect.addEventListener('change', () => {
  const filtradas = porTipo('orgs').filter(o => o.tipo === orgMaeSelect.value);
  preencherSelect(filtradas);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const membros = Number(document.getElementById('membros').value);
  if (membros < 15) {
    formMsg.textContent = 'Para assumir FAC/ORG precisa ter no mínimo 15 pessoas.';
    formMsg.style.color = '#ff6969';
    return;
  }
  formMsg.textContent = 'Enviando...'; formMsg.style.color = '#fff';
  try {
    await api('/api/formularios', {
      method: 'POST',
      body: JSON.stringify({
        org_id: orgSelect.value,
        nome_grupo: document.getElementById('grupoNome').value.trim(),
        historia: document.getElementById('historia').value.trim(),
        quantidade_membros: membros,
        lider_info: document.getElementById('liderInfo').value.trim(),
        account_id: document.getElementById('accountId').value.trim(),
        nome_completo: document.getElementById('nomeCompleto').value.trim(),
        data_nascimento: document.getElementById('nascimento').value,
        discord_id: document.getElementById('discordId').value.trim(),
        steam_hex: document.getElementById('steamHex').value.trim()
      })
    });
    form.reset();
    await carregarOrgs();
    formMsg.textContent = 'Formulário enviado com sucesso. A staff pode ver no PAINEL-STAFF.';
    formMsg.style.color = '#35ff7c';
  } catch (err) {
    formMsg.textContent = err.message;
    formMsg.style.color = '#ff6969';
  }
});

carregarOrgs();
