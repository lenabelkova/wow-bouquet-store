
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();

  let login = document.getElementById('login').value;
  let password = document.getElementById('password').value;

  let body = JSON.stringify({ login, password });

  fetch('/api/login', {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(async response => {
    if (response.status === 200) {
      let data = await response.json();
      
      if (data.isAdmin) {
        window.location.href = '/admin.html';
      } else {
        // Перенаправляем в личный кабинет после успешной авторизации
        window.location.href = '/cabinet.html';
      }
    } else if (response.status === 400) {
      alert('Неверный логин или пароль');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Произошла ошибка при авторизации');
  });
});
// login.js
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const login = document.getElementById('login').value;
  const password = document.getElementById('password').value;

  fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ login, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.href = data.redirectUrl;
    } else {
      alert(data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Произошла ошибка при авторизации');
  });
});