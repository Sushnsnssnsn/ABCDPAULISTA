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

let homeOrgsCache = [];
let homeGrupoAtual = null;

function tipoCategoriaHome(o){
  const cat = String(o.categoria || '').toUpperCase();
  const tipo = String(o.tipo || '').toUpperCase();
  if (cat === 'FAC' && tipo.includes('ARMA')) return 'armas';
  if (cat === 'FAC' && (tipo.includes('MUNI') || tipo.includes('MUNIÇÕES'))) return 'municoes';
  return 'orgs';
}

function agruparOrgs(orgs){
  return orgs.reduce((acc, item) => {
    const grupo = tipoCategoriaHome(item);
    (acc[grupo] ||= []).push(item);
    return acc;
  }, { armas: [], municoes: [], orgs: [] });
}

function nomeVisivelOrg(o){
  const nome = String(o.nome || '');
  const tipo = String(o.tipo || '').toUpperCase();
  const nomeUp = nome.toUpperCase();
  if (tipo === 'GCM' && (nomeUp === 'TRÂNSITO' || nomeUp === 'TRANSITO')) return 'Ronda Cidadã';
  return nome;
}

function labelStatusHome(status){
  return String(status || '').toLowerCase() === 'livre' ? 'Livre' : 'Ocupada/Privada';
}

function animarClique(el){
  if (!el) return;
  el.classList.remove('click-pop');
  void el.offsetWidth;
  el.classList.add('click-pop');
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
  painel.classList.remove('drop-active');
  void painel.offsetWidth;
  painel.classList.add('drop-active');

  if (screen) screen.style.display = 'none';
  opts.innerHTML = '';

  document.querySelectorAll('.home-open-card').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.homeCat === cat);
  });

  if (!homeOrgsCache.length) {
    if (tag) tag.textContent = 'Carregando';
    if (title) title.textContent = 'Buscando opções no sistema...';
    opts.innerHTML = '<p class="empty">Carregando opções...</p>';
    carregarInicioTempoReal().then(() => abrirDrilldownHome(cat));
    return;
  }

  if (cat === 'orgs') {
    if (tag) tag.textContent = 'ORG';
    if (title) title.textContent = 'Escolha a guarnição/órgão';
    const tipos = [...new Set(homeOrgsCache
      .filter(o => tipoCategoriaHome(o) === 'orgs')
      .map(o => String(o.tipo || 'ORG').trim())
      .filter(Boolean))].sort();

    opts.innerHTML = tipos.map(tipo => `
      <button type="button" class="home-choice-btn option-animate" data-choice="${tipo}">
        ${tipo}
        <small>Ver divisões</small>
      </button>
    `).join('') || '<p class="empty">Nenhuma ORG cadastrada.</p>';
  }

  if (cat === 'armas') {
    if (tag) tag.textContent = 'FAC';
    if (title) title.textContent = 'Escolha a categoria';
    opts.innerHTML = `
      <button type="button" class="home-choice-btn option-animate" data-choice="FAC ARMAS">
        FAC DE ARMA
        <small>Ver favelas/status</small>
      </button>`;
  }

  if (cat === 'municoes') {
    if (tag) tag.textContent = 'FAC';
    if (title) title.textContent = 'Escolha a categoria';
    opts.innerHTML = `
      <button type="button" class="home-choice-btn option-animate" data-choice="FAC MUNIÇÕES">
        FAC DE MUNIÇÃO
        <small>Ver favelas/status</small>
      </button>`;
  }

  setTimeout(() => painel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
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

  grid.innerHTML = lista.map((o, i) => {
    const livre = String(o.status || '').toLowerCase() === 'livre';
    return `<div class="home-status-card status-animate ${livre ? 'is-free' : 'is-busy'}" style="animation-delay:${i * 40}ms">
      <span></span>
      <strong>${nomeVisivelOrg(o)}</strong>
      <small>${labelStatusHome(o.status)}</small>
    </div>`;
  }).join('') || '<p class="empty">Nenhuma divisão cadastrada.</p>';

  screen.style.display = 'block';
  screen.classList.remove('drop-active');
  void screen.offsetWidth;
  screen.classList.add('drop-active');
  setTimeout(() => screen.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
}

async function carregarInicioTempoReal(){
  const grid = document.getElementById('homeCategoryGrid');
  if (!grid) return;

  try {
    const orgs = await api('/api/orgs');
    homeOrgsCache = Array.isArray(orgs) ? orgs : [];
    const grupos = agruparOrgs(homeOrgsCache);

    const livres = (lista) => lista.filter(o => String(o.status || '').toLowerCase() === 'livre').length;
    const total = (lista) => lista.length;

    const countOrgs = document.getElementById('countOrgs');
    const countArmas = document.getElementById('countArmas');
    const countMunicoes = document.getElementById('countMunicoes');

    if (countOrgs) countOrgs.textContent = `${livres(grupos.orgs)} livres de ${total(grupos.orgs)}`;
    if (countArmas) countArmas.textContent = `${livres(grupos.armas)} livres de ${total(grupos.armas)}`;
    if (countMunicoes) countMunicoes.textContent = `${livres(grupos.municoes)} livres de ${total(grupos.municoes)}`;

    if (homeGrupoAtual) abrirDrilldownHome(homeGrupoAtual);
  } catch (err) {
    console.warn(err.message);
    const counts = ['countOrgs','countArmas','countMunicoes'];
    counts.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = 'Erro ao carregar'; });
  }
}

document.addEventListener('click', (e) => {
  const open = e.target.closest('.home-open-card');
  if (open) {
    animarClique(open);
    abrirDrilldownHome(open.dataset.homeCat);
  }

  const choice = e.target.closest('.home-choice-btn');
  if (choice) {
    animarClique(choice);
    mostrarDivisoesHome(choice.dataset.choice);
  }
});

// Animação extra para todos os sistemas de opções do site
['change','click'].forEach(evt => {
  document.addEventListener(evt, (e) => {
    const el = e.target.closest('select, .tab-btn, .staff-btn, .btn, .mini-actions button, .org-link-card, .form-filter-tabs button, .org-selector-tabs button');
    if (el) animarClique(el);
  });
});

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
