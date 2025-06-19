// Пример данных каталога цветов
const flowersCatalog = [
    { name: "Розы", url: "AuthorBouquets.html" },
    { name: "Пионы", url: "Monobouquets.html" },
    { name: "Тюльпаны", url: "Monobouquets.html" },
    { name: "Полевые цветы", url: "FieldBouquets.html" },
    { name: "Хризантемы", url: "Monobouquets.html" },
    { name: "Цветы в корзинах", url: "FlowersInBasket.html" },
    { name: "Сухоцветы", url: "DriedFlowerBouquets.html" },
    { name: "Букеты невесты", url: "BridalBouquets.html" },
    { name: "Невестам", url: "BridalBouquets.html" }
];

document.getElementById('search-button').addEventListener('click', function() {
    performSearch();
});

document.getElementById('search-input').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        performSearch();
    } else {
        showSuggestions();
    }
});

function performSearch() {
    const query = document.getElementById('search-input').value.trim().toLowerCase();
    if (query) {
        const foundFlower = flowersCatalog.find(flower => flower.name.toLowerCase() === query);
        if (foundFlower) {
            window.location.href = foundFlower.url; // Переход на страницу цветка
        } else {
            alert("Ничего не найдено!");
        }
    }
}

function showSuggestions() {
    const input = document.getElementById('search-input').value.trim().toLowerCase();
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';

    if (input) {
        const filteredSuggestions = flowersCatalog.filter(flower =>
            flower.name.toLowerCase().includes(input)
        );

        if (filteredSuggestions.length > 0) {
            filteredSuggestions.forEach(flower => {
                const div = document.createElement('div');
                div.textContent = flower.name;
                div.addEventListener('click', function() {
                    document.getElementById('search-input').value = flower.name;
                    suggestionsContainer.style.display = 'none';
                    window.location.href = flower.url; // Переход на страницу цветка
                });
                suggestionsContainer.appendChild(div);
            });
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    } else {
        suggestionsContainer.style.display = 'none';
    }
}

// Скрываем подсказки при клике вне области поиска
document.addEventListener('click', function(event) {
    const searchContainer = document.querySelector('.search-container');
    if (!searchContainer.contains(event.target)) {
        document.getElementById('suggestions').style.display = 'none';
    }
});




document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.image-slider img');
    const indicators = document.querySelectorAll('.indicator');
    let currentIndex = 0;
    let interval;
    
    function showImage(index) {
        // Скрываем все изображения
        images.forEach(img => img.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));
        
        // Показываем выбранное изображение
        images[index].classList.add('active');
        indicators[index].classList.add('active');
        currentIndex = index;
    }
    
    function nextImage() {
        const nextIndex = (currentIndex + 1) % images.length;
        showImage(nextIndex);
    }
    
    // Автоматическая смена изображений
    function startSlider() {
        interval = setInterval(nextImage, 3000);
    }
    
    // Обработчики для индикаторов
    indicators.forEach(indicator => {
        indicator.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            showImage(index);
            resetInterval();
        });
    });
    
    function resetInterval() {
        clearInterval(interval);
        startSlider();
    }
    
    // Инициализация слайдера
    showImage(0); // Показываем первое изображение
    startSlider(); // Запускаем автоматическую смену
});



