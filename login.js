const formLogin = document.getElementById('loginForm');
const loginMsg = document.getElementById('loginMsg');
const sair = document.getElementById('sair');

if (getLoginABCD() && loginMsg) {
  loginMsg.textContent = 'Você já está logado.';
  loginMsg.style.color = '#35ff7c';
}

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const senha = document.getElementById('senha').value.trim();
  loginMsg.textContent = 'Entrando...';
  loginMsg.style.color = '#fff';
  try {
    const resposta = await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ senha })
    });
    localStorage.setItem('tokenABCD', resposta.token);
    atualizarMenuLogin();
    loginMsg.textContent = 'Login feito com sucesso. Abrindo PAINEL-STAFF...';
    loginMsg.style.color = '#35ff7c';
    setTimeout(() => window.location.href = 'painel-staff.html', 700);
  } catch (err) {
    loginMsg.textContent = err.message || 'Senha incorreta.';
    loginMsg.style.color = '#ff6969';
  }
});

if (sair) sair.addEventListener('click', () => {
  sairABCD();
  loginMsg.textContent = 'Você saiu da conta.';
  loginMsg.style.color = '#35ff7c';
});
