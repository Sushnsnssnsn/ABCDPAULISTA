const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  if (loader) setTimeout(() => loader.classList.add('hide'), 650);
});

const menu = document.getElementById('menu');
const nav = document.getElementById('nav');
if (menu && nav) menu.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => nav && nav.classList.remove('open')));

function getLoginABCD(){
  try { return JSON.parse(localStorage.getItem('loginABCD') || 'null'); } catch { return null; }
}
function atualizarMenuLogin(){
  const logado = !!getLoginABCD();
  document.querySelectorAll('.login-link').forEach(el => el.style.display = logado ? 'none' : 'inline-flex');
  document.querySelectorAll('.logout-btn').forEach(el => el.style.display = logado ? 'inline-flex' : 'none');
  document.querySelectorAll('.staff-link').forEach(el => el.style.display = logado ? 'inline-flex' : 'none');
}
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'logoutBtn') {
    localStorage.removeItem('loginABCD');
    atualizarMenuLogin();
    if (location.pathname.includes('painel-staff')) location.href = 'login.html';
  }
});
atualizarMenuLogin();

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('show'); });
}, { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  if (header) header.style.background = window.scrollY > 30 ? 'rgba(5,6,10,.78)' : 'rgba(5,6,10,.55)';
});
