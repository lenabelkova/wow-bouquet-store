document.getElementById("register-form").addEventListener("submit", (e) => {
            e.preventDefault();
            
            // Сброс предыдущих ошибок
            resetErrors();
            
            // Получение значений полей
            let login = document.getElementById("login").value;
            let password = document.getElementById("password").value;
            let phone = document.getElementById("phone").value;
            let email = document.getElementById("email").value;
            let fullName = document.getElementById("fullName").value;
            
            // Валидация
            let isValid = true;
            
            // Валидация пароля (минимум 6 символов)
            if (password.length < 6) {
                showError('password', 'Пароль должен содержать минимум 6 символов');
                isValid = false;
            }
            
            // Валидация ФИО (только кириллица и пробелы)
            if (!/^[а-яА-ЯёЁ\s]+$/.test(fullName)) {
                showError('fullName', 'ФИО должно содержать только кириллицу и пробелы');
                isValid = false;
            }
            
            // Валидация телефона (формат +7(XXX)XXX-XX-XX)
            if (!/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(phone)) {
                showError('phone', 'Введите телефон в формате +7(XXX)XXX-XX-XX');
                isValid = false;
            }
            
            // Валидация email
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showError('email', 'Введите корректный email');
                isValid = false;
            }
            
            if (!isValid) return;
            
            // Отправка данных, если валидация прошла успешно
            let body = JSON.stringify({ login, password, phone, email, fullName });
            
            fetch("/api/register", {
                method: "POST",
                body: body,
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if(response.status === 200) {
                        alert("Регистрация прошла успешно! Теперь вы можете войти в систему.");
                        window.location.href = 'login.html';
                    }
                    else if(response.status === 409) {
                        showError('login', 'Пользователь с таким логином уже существует');
                    }
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    alert('Произошла ошибка при регистрации');
                });
        });
        
        function showError(fieldId, message) {
            let field = document.getElementById(fieldId);
            let errorElement = document.getElementById(fieldId + '-error');
            
            field.classList.add('input-error');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        function resetErrors() {
            let errors = document.querySelectorAll('.error-message');
            errors.forEach(error => {
                error.style.display = 'none';
            });
            
            let inputs = document.querySelectorAll('input');
            inputs.forEach(input => {
                input.classList.remove('input-error');
            });
        }
        
        // Маска для телефона
        document.getElementById('phone').addEventListener('input', function(e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
            e.target.value = !x[2] ? '+7' : '+7(' + x[2] + (x[3] ? ')' + x[3] : '') + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
        });
        // register.js
document.getElementById('register-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = {
    login: document.getElementById('login').value,
    password: document.getElementById('password').value,
    fullName: document.getElementById('fullName').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value
  };

  fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert(data.message);
      window.location.href = data.redirectUrl;
    } else {
      alert(data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Произошла ошибка при регистрации');
  });
});