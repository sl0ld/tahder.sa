const sessionKey = 'tahder-site-session';
const dialog = document.getElementById('login-dialog');
const loginForm = document.getElementById('login-form');
const accountEmpty = document.getElementById('account-empty');
const accountActive = document.getElementById('account-active');
const accountEmail = document.getElementById('account-email');
const logoutButton = document.getElementById('logout-button');

function readSession() {
  const stored = localStorage.getItem(sessionKey);
  return stored ? JSON.parse(stored) : null;
}

function renderSession() {
  const session = readSession();
  accountEmpty.hidden = Boolean(session);
  accountActive.hidden = !session;

  if (session) {
    accountEmail.textContent = session.email;
  }
}

document.querySelectorAll('[data-open-login]').forEach((button) => {
  button.addEventListener('click', () => {
    dialog.hidden = false;
  });
});

document.querySelector('.dialog-close').addEventListener('click', () => {
  dialog.hidden = true;
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  localStorage.setItem(sessionKey, JSON.stringify({
    email: String(formData.get('email') || ''),
    subscription: 'active',
  }));
  dialog.hidden = true;
  renderSession();
  document.getElementById('account').scrollIntoView({ behavior: 'smooth' });
});

logoutButton.addEventListener('click', () => {
  localStorage.removeItem(sessionKey);
  renderSession();
});

renderSession();
