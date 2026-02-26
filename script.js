// Localize the footer year
document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('notify-form');
const emailInput = document.getElementById('email');
const statusEl = document.getElementById('form-status');
const btn = document.getElementById('notify-btn');

function isValidEmail(v){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = '';
  statusEl.className = 'form-status';
  const email = emailInput.value.trim();

  if(!isValidEmail(email)){
    statusEl.textContent = 'Please enter a valid email address.';
    statusEl.classList.add('err');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    if(res.ok){
      statusEl.textContent = 'Thanks! We will notify you when we launch.';
      statusEl.classList.add('ok');
      form.reset();
    } else {
      statusEl.textContent = data?.error || 'Something went wrong. Please use the email link below.';
      statusEl.classList.add('err');
    }
  } catch(err){
    statusEl.textContent = 'Network error. Please try again or use the email link below.';
    statusEl.classList.add('err');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Get notified / Register';
  }
});