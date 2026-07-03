const orgParams = new URLSearchParams(window.location.search);
const orgButtons = document.getElementById('orgButtons');
const orgDivisoes = document.getElementById('orgDivisoes');
const orgSelectedTitle = document.getElementById('orgSelectedTitle');
let orgsPublicas = [];
let orgAtual = orgParams.get('org') || '';

function nomeVisivelOrg(o){
  const nome = String(o.nome || '');
  const tipo = String(o.tipo || '').toUpperCase();
  if (tipo === 'GCM' && nome.toUpperCase() === 'TRÂNSITO') return 'Ronda Cidadã';
  if (tipo === 'GCM' && nome.toUpperCase() === 'TRANSITO') return 'Ronda Cidadã';
  return nome;
}
function somenteOrgs(){
  return orgsPublicas.filter(o => String(o.categoria || '').toUpperCase() === 'ORG');
}
function tiposOrgs(){
  return [...new Set(somenteOrgs().map(o => o.tipo).filter(Boolean))].sort();
}
function setOrg(tipo){
  orgAtual = tipo || tiposOrgs()[0] || '';
  renderOrgs();
  const url = new URL(window.location.href);
  if (orgAtual) url.searchParams.set('org', orgAtual);
  history.replaceState(null, '', url.toString());
}
function renderOrgs(){
  const tipos = tiposOrgs();
  if (!orgAtual && tipos.length) orgAtual = tipos[0];

  orgButtons.innerHTML = tipos.map(t => `<button type="button" class="${t === orgAtual ? 'active' : ''}" data-org="${t}">${t}</button>`).join('');
  orgButtons.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => setOrg(btn.dataset.org)));

  const lista = somenteOrgs().filter(o => o.tipo === orgAtual);
  orgSelectedTitle.textContent = orgAtual ? `${orgAtual} — divisões` : 'Divisões';

  if (!lista.length) {
    orgDivisoes.innerHTML = '<p class="empty">Nenhuma divisão cadastrada para essa org.</p>';
    return;
  }

  orgDivisoes.innerHTML = lista.map(o => `
    <a class="org-card org-link-card" href="assumir.html?tipo=orgs&org=${encodeURIComponent(o.tipo)}">
      ${nomeVisivelOrg(o)}<br><small>${o.status}</small>
    </a>
  `).join('');
}
async function carregarOrgsPublicas(){
  try {
    orgsPublicas = await api('/api/orgs');
    renderOrgs();
  } catch (err) {
    orgDivisoes.innerHTML = `<p class="empty">Erro ao carregar: ${err.message}</p>`;
  }
}
carregarOrgsPublicas();
setInterval(carregarOrgsPublicas, 7000);
