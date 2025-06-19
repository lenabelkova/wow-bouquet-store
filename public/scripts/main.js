// Корзина
class Cart {
    constructor() {
        this.products = [];
    }
    
    get count() {
        return this.products.reduce((sum, product) => sum + (product.quantity || 1), 0);
    }
    
    addProduct(product) {
        // Проверяем, есть ли уже такой товар в корзине
        const existingProductIndex = this.products.findIndex(p => 
            p.name === product.name && 
            p.price === product.price &&
            (!p.imageSrc || p.imageSrc === product.imageSrc)
        );
        
        if (existingProductIndex >= 0) {
            // Если товар уже есть - увеличиваем количество
            this.products[existingProductIndex].quantity = 
                (this.products[existingProductIndex].quantity || 1) + 1;
        } else {
            // Если нет - добавляем новый товар
            this.products.push({...product, quantity: 1});
        }
    }
    
    removeProduct(index) {
        if (index >= 0 && index < this.products.length) {
            this.products.splice(index, 1);
            return true;
        }
        return false;
    }
    
    get cost() {
        return this.products.reduce((sum, product) => sum + (toNum(product.price) * (product.quantity || 1)), 0);
    }
    
    get costDiscount() {
        return this.products.reduce((sum, product) => sum + 
            (toNum(product.priceDiscount || product.price) * (product.quantity || 1)), 0);
    }
    
    get discount() {
        return this.cost - this.costDiscount;
    }
}

const myCart = new Cart();

// Утилиты
function toNum(str) {
    if (!str) return 0;
    const num = Number(str.toString().replace(/ /g, "").replace(/[^\d]/g, ""));
    return isNaN(num) ? 0 : num;
}

function toCurrency(num) {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 0,
    }).format(num);
}

// Инициализация корзины
function loadCart() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
        try {
            const parsedCart = JSON.parse(savedCart);
            myCart.products = parsedCart.products || [];
            updateCartCounters();
        } catch (e) {
            console.error("Error parsing cart:", e);
            myCart.products = [];
        }
    }
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(myCart));
    updateCartCounters();
}

// Функция для обновления всех счетчиков корзины
function updateCartCounters() {
    const count = myCart.count;
    
    // Обновляем счетчики в десктопной и мобильной версии
    const counters = [
        document.getElementById('cart_num'),
        document.getElementById('mobile-cart_num')
    ];
    
    counters.forEach(counter => {
        if (counter) {
            counter.textContent = count;
            counter.style.display = count > 0 ? 'flex' : 'none';
        }
    });
    
    // Обновляем сообщение о пустой корзине
    const emptyMsg = document.getElementById('empty-cart-message');
    if (emptyMsg) emptyMsg.style.display = count > 0 ? 'none' : 'block';
}

// Заполнение попапа корзины
function fillPopup() {
    const popupProductList = document.querySelector("#popup_product_list");
    const popupCost = document.querySelector("#popup_cost");
    const popupDiscount = document.querySelector("#popup_discount");
    const popupCostDiscount = document.querySelector("#popup_cost_discount");
    
    if (!popupProductList) return;
    
    popupProductList.innerHTML = "";
    
    if (myCart.count === 0) {
        popupProductList.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
    } else {
        myCart.products.forEach((product, index) => {
            const productItem = document.createElement("div");
            productItem.classList.add("popup__product-item");
            
            const productInfo = document.createElement("div");
            productInfo.classList.add("popup__product-info");
            
            if (product.imageSrc) {
                const productImage = document.createElement("img");
                productImage.classList.add("popup__product-image");
                productImage.src = product.imageSrc;
                productImage.alt = product.name || product.title;
                productInfo.appendChild(productImage);
            }
            
            const productName = document.createElement("div");
            productName.classList.add("popup__product-name");
            productName.textContent = (product.name || product.title || "Товар без названия") + 
                                   (product.quantity > 1 ? ` (${product.quantity} шт.)` : '');
            
            const productPrice = document.createElement("div");
            productPrice.classList.add("popup__product-price");
            productPrice.textContent = toCurrency(toNum(product.priceDiscount || product.price));
            
            const productDelete = document.createElement("button");
            productDelete.classList.add("popup__product-delete");
            productDelete.innerHTML = "&#10006;";
            productDelete.addEventListener("click", (e) => {
                e.preventDefault();
                if (myCart.removeProduct(index)) {
                    saveCart();
                    fillPopup();
                }
            });
            
            productItem.appendChild(productInfo);
            productItem.appendChild(productName);
            productItem.appendChild(productPrice);
            productItem.appendChild(productDelete);
            popupProductList.appendChild(productItem);
        });
        
        // Добавляем кнопку оформления заказа
        const orderBtn = document.createElement('a');
        orderBtn.href = 'OrderForm.html';
        orderBtn.className = 'banner-btnn';
        orderBtn.textContent = 'Оформить заказ';
        orderBtn.style.margin = '20px 0 0 auto';
        orderBtn.style.display = 'block';
        orderBtn.style.textAlign = 'center';
        orderBtn.style.width = 'fit-content';
        popupProductList.appendChild(orderBtn);
    }
    
    if (popupCost) popupCost.textContent = toCurrency(myCart.cost);
    if (popupDiscount) popupDiscount.textContent = toCurrency(myCart.discount);
    if (popupCostDiscount) popupCostDiscount.textContent = toCurrency(myCart.costDiscount);
}

// Управление мобильным меню и корзиной
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация корзины
    loadCart();
    
    // Обработчики мобильного меню
    const burgerBtn = document.getElementById('burgerBtn');
    const closeBtn = document.getElementById('closeMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('menuOverlay');
    const cartPopup = document.getElementById('cartPopup');
    const popupClose = document.getElementById('popup_close');
    
    function toggleMenu() {
        burgerBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }
    
    if (burgerBtn) burgerBtn.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
    
    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.mobile-nav a, .mobile-actions a').forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    // Обработчики для открытия корзины
    function setupCartButton(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                if (cartPopup) {
                    cartPopup.classList.add('active');
                    document.body.classList.add('no-scroll');
                    fillPopup();
                }
            });
        }
    }
    
    // Настраиваем обе кнопки корзины
    setupCartButton('cart');
    setupCartButton('mobile-cart');
    
    // Закрытие попапа
    if (popupClose) {
        popupClose.addEventListener('click', function() {
            if (cartPopup) {
                cartPopup.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    }
    
    // Закрытие при клике на оверлей
    if (cartPopup) {
        cartPopup.addEventListener('click', function(e) {
            if (e.target === cartPopup) {
                cartPopup.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    }

    // Проверка статуса авторизации
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Обновляем ссылки на личный кабинет
                document.querySelectorAll('.account').forEach(link => {
                    link.href = '/cabinet.html';
                });
            }
        })
        .catch(error => console.error('Error:', error));
        
    // Обработка добавления товаров
    document.querySelectorAll('.card__add').forEach(btn => {
        if (btn.closest('.constructor-steps')) return;
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.card');
            if (!card) return;
            
            const titleEl = card.querySelector('.card__title');
            const priceEl = card.querySelector('.card__price--common');
            const discountEl = card.querySelector('.card__price--discount');
            const imageEl = card.querySelector('.card__image img');
            
            if (!titleEl || !priceEl) return;
            
            const product = {
                type: 'product',
                name: titleEl.textContent,
                price: priceEl.textContent,
                priceDiscount: discountEl?.textContent,
                imageSrc: imageEl?.src
            };
            
            myCart.addProduct(product);
            saveCart();
            
            // Показываем попап корзины
            if (cartPopup) {
                cartPopup.classList.add('active');
                document.body.classList.add('no-scroll');
                fillPopup();
            }
        });
    });
});








document.addEventListener('DOMContentLoaded', function () {
  const sortPriceSelect = document.getElementById('sort-by-price');
  const sortColorSelect = document.getElementById('sort-by-color');
  const cardsContainer = document.querySelector('.cards');
  let cards = Array.from(document.querySelectorAll('.card'));

  // Функция сортировки
  function sortCards() {
      const sortByPrice = sortPriceSelect.value;
      const sortByColor = sortColorSelect.value;

      // Сортировка по цене
      cards.sort((a, b) => {
          const priceA = parseFloat(a.dataset.price);
          const priceB = parseFloat(b.dataset.price);

          if (sortByPrice === 'price-asc') {
              return priceA - priceB; // По возрастанию
          } else if (sortByPrice === 'price-desc') {
              return priceB - priceA; // По убыванию
          }
          return 0;
      });

      // Фильтрация по цвету
      const filteredCards = cards.filter(card => {
          const cardColor = card.dataset.color;
          return sortByColor === 'all' || cardColor === sortByColor;
      });

      // Очищаем контейнер и добавляем отсортированные карточки
      cardsContainer.innerHTML = '';
      filteredCards.forEach(card => cardsContainer.appendChild(card));
  }

  // Сортировка при изменении выбора
  sortPriceSelect.addEventListener('change', sortCards);
  sortColorSelect.addEventListener('change', sortCards);
});







