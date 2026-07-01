const SENHA_SITE = 'ABCD2026';
const formLogin = document.getElementById('loginForm');
const loginMsg = document.getElementById('loginMsg');
const sair = document.getElementById('sair');

if (getLoginABCD()) {
  loginMsg.textContent = 'Você já está logado.';
  loginMsg.style.color = '#35ff7c';
}

formLogin.addEventListener('submit', (e) => {
  e.preventDefault();
  const senha = document.getElementById('senha').value.trim();
  if (senha === SENHA_SITE) {
    localStorage.setItem('loginABCD', JSON.stringify({ data: new Date().toLocaleString('pt-BR') }));
    atualizarMenuLogin();
    loginMsg.textContent = 'Login feito com sucesso. Abrindo PAINEL-STAFF...';
    loginMsg.style.color = '#35ff7c';
    setTimeout(() => window.location.href = 'painel-staff.html', 700);
  } else {
    loginMsg.textContent = 'Senha incorreta.';
    loginMsg.style.color = '#ff6969';
  }
});

sair.addEventListener('click', () => {
  localStorage.removeItem('loginABCD');
  atualizarMenuLogin();
  loginMsg.textContent = 'Você saiu da conta.';
  loginMsg.style.color = '#35ff7c';
});
