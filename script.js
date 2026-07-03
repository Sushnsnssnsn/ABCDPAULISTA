const API_URL = 'https://backend-abcd.onrender.com';

const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  if (loader) setTimeout(() => loader.classList.add('hide'), 650);
});

const menu = document.getElementById('menu');
const nav = document.getElementById('nav');
if (menu && nav) menu.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => nav && nav.classList.remove('open')));

function getTokenABCD(){ return localStorage.getItem('tokenABCD'); }
function getLoginABCD(){ return !!getTokenABCD(); }
function sairABCD(){ localStorage.removeItem('tokenABCD'); atualizarMenuLogin(); }
function atualizarMenuLogin(){
  const logado = !!getLoginABCD();
  document.querySelectorAll('.login-link').forEach(el => el.style.display = logado ? 'none' : 'inline-flex');
  document.querySelectorAll('.logout-btn').forEach(el => el.style.display = logado ? 'inline-flex' : 'none');
  document.querySelectorAll('.staff-link').forEach(el => el.style.display = logado ? 'inline-flex' : 'none');
}
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'logoutBtn') {
    sairABCD();
    if (location.pathname.includes('painel-staff')) location.href = 'login.html';
  }
});
atualizarMenuLogin();

async function api(path, options = {}){
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getTokenABCD();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) throw new Error(json.erro || 'Erro na API');
  return json.data ?? json;
}

function agruparOrgs(orgs){
  return orgs.reduce((acc, item) => {
    const cat = String(item.categoria || '').toUpperCase();
    const tipo = String(item.tipo || '').toUpperCase();
    let grupo = 'orgs';
    if (cat === 'FAC' && tipo.includes('ARMA')) grupo = 'armas';
    else if (cat === 'FAC' && (tipo.includes('MUNI') || tipo.includes('MUNIÇÕES'))) grupo = 'municoes';
    else grupo = 'orgs';
    (acc[grupo] ||= []).push(item);
    return acc;
  }, { armas: [], municoes: [], orgs: [] });
}

function nomeVisivelOrg(o){
  const nome = String(o.nome || '');
  const tipo = String(o.tipo || '').toUpperCase();
  if (tipo === 'GCM' && nome.toUpperCase() === 'TRÂNSITO') return 'Ronda Cidadã';
  if (tipo === 'GCM' && nome.toUpperCase() === 'TRANSITO') return 'Ronda Cidadã';
  return nome;
}

function statusClass(status){
  status = String(status || '').toLowerCase();
  if (status === 'livre') return 'free';
  return 'busy';
}

async function carregarInicioTempoReal(){
  if (!document.body || !document.getElementById('faccoes')) return;
  try {
    const orgs = await api('/api/orgs');
    const grupos = agruparOrgs(orgs);

    let box = document.getElementById('statusBancoBox');
    if (!box) {
      box = document.createElement('section');
      box.id = 'statusBancoBox';
      box.className = 'section';
      box.innerHTML = `<div class="section-title reveal show"><p class="tag">Atualizado pelo painel staff</p><h2>Status em tempo real</h2></div><div class="grid two" id="statusBancoGrid"></div>`;
      document.getElementById('faccoes').prepend(box);
    }

    const grid = document.getElementById('statusBancoGrid');
    const renderLista = (titulo, lista) => `
      <article class="category reveal show">
        <div class="category-head"><h3>${titulo}</h3><span class="badge">Banco</span></div>
        <div class="items compact">
          ${lista.map(o => `<div class="item ${statusClass(o.status)}"><span></span> ${o.tipo} - ${nomeVisivelOrg(o)} <small>(${o.status})</small></div>`).join('') || '<p class="empty">Nada cadastrado.</p>'}
        </div>
      </article>`;

    grid.innerHTML = renderLista('FAC Armas', grupos.armas) + renderLista('FAC Munições', grupos.municoes) + renderLista('Orgs Públicas', grupos.orgs);
  } catch (err) {
    console.warn(err.message);
  }
}

carregarInicioTempoReal();
if (document.getElementById('faccoes')) setInterval(carregarInicioTempoReal, 5000);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('show'); });
}, { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  if (header) header.style.background = window.scrollY > 30 ? 'rgba(5,6,10,.78)' : 'rgba(5,6,10,.55)';
});
