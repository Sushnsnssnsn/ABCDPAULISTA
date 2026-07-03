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
  const grid = document.getElementById('homeCategoryGrid');
  if (!grid) return;

  try {
    const orgs = await api('/api/orgs');
    homeOrgsCache = orgs;
    const grupos = agruparOrgs(orgs);
    if (homeGrupoAtual) abrirDrilldownHome(homeGrupoAtual);

    const livres = (lista) => lista.filter(o => String(o.status || '').toLowerCase() === 'livre').length;
    const total = (lista) => lista.length;

    const countOrgs = document.getElementById('countOrgs');
    const countArmas = document.getElementById('countArmas');
    const countMunicoes = document.getElementById('countMunicoes');

    if (countOrgs) countOrgs.textContent = `${livres(grupos.orgs)} livres de ${total(grupos.orgs)}`;
    if (countArmas) countArmas.textContent = `${livres(grupos.armas)} livres de ${total(grupos.armas)}`;
    if (countMunicoes) countMunicoes.textContent = `${livres(grupos.municoes)} livres de ${total(grupos.municoes)}`;
  } catch (err) {
    console.warn(err.message);
  }
}

carregarInicioTempoReal();
setInterval(carregarInicioTempoReal, 5000);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('show'); });
}, { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  if (header) header.style.background = window.scrollY > 30 ? 'rgba(5,6,10,.78)' : 'rgba(5,6,10,.55)';
});

// Drilldown da tela inicial: 3 tabelas -> opções -> status das divisões
let homeOrgsCache = [];
let homeGrupoAtual = null;

function tipoCategoriaHome(o){
  const cat = String(o.categoria || '').toUpperCase();
  const tipo = String(o.tipo || '').toUpperCase();
  if (cat === 'FAC' && tipo.includes('ARMA')) return 'armas';
  if (cat === 'FAC' && (tipo.includes('MUNI') || tipo.includes('MUNIÇÕES'))) return 'municoes';
  return 'orgs';
}

function labelStatusHome(status){
  return String(status || '').toLowerCase() === 'livre' ? 'Livre' : 'Ocupada/Privada';
}

function abrirDrilldownHome(cat){
  homeGrupoAtual = cat;
  const painel = document.getElementById('homeDrilldown');
  const tag = document.getElementById('homeDrillTag');
  const title = document.getElementById('homeDrillTitle');
  const opts = document.getElementById('homeOptionGrid');
  const screen = document.getElementById('homeDivisionScreen');
  if (!painel || !opts) return;

  painel.style.display = 'block';
  screen.style.display = 'none';
  opts.innerHTML = '';

  document.querySelectorAll('.home-open-card').forEach(btn => btn.classList.toggle('active', btn.dataset.homeCat === cat));

  if (cat === 'orgs') {
    tag.textContent = 'ORG';
    title.textContent = 'Escolha qual órgão/guarnição deseja ver';
    const tipos = [...new Set(homeOrgsCache.filter(o => tipoCategoriaHome(o) === 'orgs').map(o => String(o.tipo || 'ORG')))].sort();
    opts.innerHTML = tipos.map(tipo => `<button type="button" class="home-choice-btn" data-choice="${tipo}">${tipo}</button>`).join('') || '<p class="empty">Nenhuma ORG cadastrada.</p>';
  }

  if (cat === 'armas') {
    tag.textContent = 'FAC';
    title.textContent = 'Escolha para ver FAC de arma';
    opts.innerHTML = `<button type="button" class="home-choice-btn" data-choice="FAC ARMAS">FAC DE ARMA</button>`;
  }

  if (cat === 'municoes') {
    tag.textContent = 'FAC';
    title.textContent = 'Escolha para ver FAC de munição';
    opts.innerHTML = `<button type="button" class="home-choice-btn" data-choice="FAC MUNIÇÕES">FAC DE MUNIÇÃO</button>`;
  }

  painel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function mostrarDivisoesHome(choice){
  const screen = document.getElementById('homeDivisionScreen');
  const title = document.getElementById('homeDivisionTitle');
  const grid = document.getElementById('homeStatusGrid');
  if (!screen || !grid || !title) return;

  let lista = [];
  if (homeGrupoAtual === 'orgs') {
    lista = homeOrgsCache.filter(o => tipoCategoriaHome(o) === 'orgs' && String(o.tipo || '') === choice);
    title.textContent = `Divisões da ${choice}`;
  } else if (homeGrupoAtual === 'armas') {
    lista = homeOrgsCache.filter(o => tipoCategoriaHome(o) === 'armas');
    title.textContent = 'FAC de Arma';
  } else if (homeGrupoAtual === 'municoes') {
    lista = homeOrgsCache.filter(o => tipoCategoriaHome(o) === 'municoes');
    title.textContent = 'FAC de Munição';
  }

  grid.innerHTML = lista.map(o => {
    const livre = String(o.status || '').toLowerCase() === 'livre';
    return `<div class="home-status-card ${livre ? 'is-free' : 'is-busy'}">
      <span></span>
      <strong>${nomeVisivelOrg(o)}</strong>
      <small>${labelStatusHome(o.status)}</small>
    </div>`;
  }).join('') || '<p class="empty">Nenhuma divisão cadastrada.</p>';

  screen.style.display = 'block';
  screen.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('click', (e) => {
  const open = e.target.closest('.home-open-card');
  if (open) abrirDrilldownHome(open.dataset.homeCat);

  const choice = e.target.closest('.home-choice-btn');
  if (choice) mostrarDivisoesHome(choice.dataset.choice);
});
