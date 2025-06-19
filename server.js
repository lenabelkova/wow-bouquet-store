const express = require('express');
const session = require('express-session');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const docx = require('docx');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

// Настройка подключения к базе данных
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '172.17.0.1',
  port: 5432,
  username: 'wow',
  password: '00001111',
  database: 'wow'
});

// Модель пользователя
const User = sequelize.define('User', {
  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  avatar: {
    type: DataTypes.STRING
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'client'
  }
});

// Модель заказа
const Order = sequelize.define('Order', {
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  items: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  discount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'new'
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  deliveryComment: {
    type: DataTypes.TEXT
  },
  paymentMethod: {
    type: DataTypes.STRING,
    defaultValue: 'cash'
  }
});

// Модель адреса
const Address = sequelize.define('Address', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false
  },
  house: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apartment: {
    type: DataTypes.STRING
  },
  comment: {
    type: DataTypes.TEXT
  }
});

// Модель отзыва
const Review = sequelize.define('Review', {
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});
// Модель категории
const Category = sequelize.define('Category', {
  CategoryId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    validate: {
      min: 1
    }
  },
  Name: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
});

// Модель продукта
const Product = sequelize.define('Product', {
  ProductId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    validate: {
      min: 1
    }
  },
  Name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Description: {
    type: DataTypes.TEXT
  },
  Price: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  ProductImages: {
    type: DataTypes.TEXT // Можно также использовать DataTypes.ARRAY(DataTypes.STRING) для PostgreSQL
  },
  Stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  IsComponent: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
});

// Модель пользовательского дизайна
const CustomDesign = sequelize.define('CustomDesign', {
  DesignId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    validate: {
      min: 1
    }
  },
  Name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  TotalPrice: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  CreatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

// Модель компонентов дизайна
const DesignComponent = sequelize.define('DesignComponent', {
  Quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// Модель элемента заказа
const OrderItem = sequelize.define('OrderItem', {
  OrderItemId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    validate: {
      min: 1
    }
  },
  Quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Price: {
    type: DataTypes.DECIMAL,
    allowNull: false
  }
});

// Модель корзины
const Cart = sequelize.define('Cart', {
  CartId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    validate: {
      min: 1
    }
  }
});

// Модель элемента корзины
const CartItem = sequelize.define('CartItem', {
  CartItemId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    validate: {
      min: 1
    }
  },
  Quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Price: {
    type: DataTypes.DECIMAL
  }
});

// Связи между моделями
User.hasMany(Review);
Review.belongsTo(User);
User.hasMany(Order);
Order.belongsTo(User);
User.hasMany(Address);
Address.belongsTo(User);
// Связи между моделями
Category.hasMany(Category, {
  foreignKey: 'ParentId',
  as: 'Subcategories'
});
Category.belongsTo(Category, {
  foreignKey: 'ParentId',
  as: 'ParentCategory'
});

Category.hasMany(Product, {
  foreignKey: 'CategoryId'
});
Product.belongsTo(Category, {
  foreignKey: 'CategoryId'
});

User.hasMany(CustomDesign, {
  foreignKey: 'UserId'
});
CustomDesign.belongsTo(User, {
  foreignKey: 'UserId'
});

CustomDesign.belongsToMany(Product, {
  through: DesignComponent,
  foreignKey: 'DesignId',
  otherKey: 'ProductId'
});
Product.belongsToMany(CustomDesign, {
  through: DesignComponent,
  foreignKey: 'ProductId',
  otherKey: 'DesignId'
});

Order.hasMany(OrderItem, {
  foreignKey: 'OrderId'
});
OrderItem.belongsTo(Order, {
  foreignKey: 'OrderId'
});

OrderItem.belongsTo(Product, {
  foreignKey: 'ProductId'
});
OrderItem.belongsTo(CustomDesign, {
  foreignKey: 'DesignId'
});

User.hasOne(Cart, {
  foreignKey: 'UserId'
});
Cart.belongsTo(User, {
  foreignKey: 'UserId'
});

Cart.hasMany(CartItem, {
  foreignKey: 'CartId'
});
CartItem.belongsTo(Cart, {
  foreignKey: 'CartId'
});

CartItem.belongsTo(Product, {
  foreignKey: 'ProductId'
});
CartItem.belongsTo(CustomDesign, {
  foreignKey: 'DesignId'
});
// Настройка Multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'public', 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.session.userId + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Инициализация Express
const app = express();
const PORT = 3004;

// Middleware
app.use(express.static(path.join(__dirname, './public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret_key_123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Проверка аутентификации
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

// Проверка администратора
const requireAdmin = (req, res, next) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

// Генератор номера заказа
function generateOrderNumber() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
 // Загрузка аватара
app.post('/api/upload-avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "Файл не был загружен" 
      });
    }

    const avatarUrl = '/uploads/avatars/' + req.file.filename;
    
    // Обновляем аватар пользователя в базе данных
    await User.update(
      { avatar: avatarUrl },
      { where: { id: req.session.userId } }
    );

    res.json({ 
      success: true,
      avatarUrl: avatarUrl
    });
  } catch (error) {
    console.error("Ошибка загрузки аватара:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при загрузке аватара" 
    });
  }
});

// Получение данных пользователя
app.get('/api/user', requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'login', 'fullName', 'phone', 'email', 'avatar', 'role']
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Если аватар не установлен, используем граватар
    let avatarUrl = user.avatar;
    if (!avatarUrl) {
      const emailHash = crypto.createHash('md5').update(user.email).digest('hex');
      avatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;
    }

    res.json({ 
      success: true, 
      user: {
        ...user.get({ plain: true }),
        avatar: avatarUrl
      },
      isAdmin: req.session.isAdmin || user.role === 'admin'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Маршруты для админ-панели
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where[Sequelize.Op.or] = [
        { orderNumber: { [Sequelize.Op.iLike]: `%${search}%` } },
        { '$User.fullName$': { [Sequelize.Op.iLike]: `%${search}%` } },
        { '$User.phone$': { [Sequelize.Op.iLike]: `%${search}%` } }
      ];
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'fullName', 'email', 'phone']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      orders,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
    
  } catch (error) {
    console.error("Ошибка получения заказов:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при получении заказов" 
    });
  }
});

// Экспорт заказов в Word
app.get('/api/admin/orders/export-word', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    
    const orders = await Order.findAll({
      where,
      include: [{
        model: User,
        attributes: ['fullName', 'phone']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    if (orders.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Нет заказов для экспорта" 
      });
    }
    
    // Создаем документ Word
    const { Document, Paragraph, TextRun, Table, TableRow, TableCell } = docx;
    
    const doc = new Document();
    
    const title = new Paragraph({
      children: [
        new TextRun({
          text: "Отчет о заказах",
          bold: true,
          size: 28
        })
      ],
      spacing: {
        after: 200
      }
    });
    
    const dateInfo = new Paragraph({
      children: [
        new TextRun({
          text: `Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`,
          size: 22
        })
      ],
      spacing: {
        after: 200
      }
    });
    
    const filterInfo = new Paragraph({
      children: [
        new TextRun({
          text: `Фильтр по статусу: ${getStatusText(status || 'all')}`,
          size: 22
        })
      ],
      spacing: {
        after: 200
      }
    });
    
    // Создаем таблицу
    const table = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("№ заказа")] }),
            new TableCell({ children: [new Paragraph("Клиент")] }),
            new TableCell({ children: [new Paragraph("Дата")] }),
            new TableCell({ children: [new Paragraph("Сумма")] }),
            new TableCell({ children: [new Paragraph("Статус")] })
          ]
        }),
        ...orders.map(order => {
          const customer = order.User || {};
          return new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(order.orderNumber)] }),
              new TableCell({ children: [new Paragraph(customer.fullName || order.customerName || 'Не указано')] }),
              new TableCell({ children: [new Paragraph(new Date(order.createdAt).toLocaleDateString('ru-RU'))] }),
              new TableCell({ children: [new Paragraph(`${order.total} ₽`)] }),
              new TableCell({ children: [new Paragraph(getStatusText(order.status))] })
            ]
          });
        })
      ]
    });
    
    doc.addSection({
      children: [title, dateInfo, filterInfo, table]
    });
    
    // Генерируем файл
    const buffer = await docx.Packer.toBuffer(doc);
    
    // Отправляем файл
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=orders_report_${new Date().toISOString().split('T')[0]}.docx`);
    res.send(buffer);
    
  } catch (error) {
    console.error("Ошибка экспорта в Word:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при экспорте в Word" 
    });
  }
});

// Изменение статуса заказа
app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false,
        message: "Статус обязателен" 
      });
    }
    
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Заказ не найден" 
      });
    }
    
    order.status = status;
    if (status === 'cancelled' && reason) {
      order.deliveryComment = reason;
    }
    
    await order.save();
    
    res.json({ 
      success: true,
      message: "Статус заказа обновлен"
    });
    
  } catch (error) {
    console.error("Ошибка обновления статуса:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при обновлении статуса" 
    });
  }
});

// Получение статистики для админ-панели
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const newOrders = await Order.count({ where: { status: 'new' } });
    const completedOrders = await Order.count({ where: { status: 'completed' } });
    
    const totalRevenue = await Order.sum('total', {
      where: { status: 'completed' }
    });
    
    const avgOrderValue = await Order.findOne({
      attributes: [
        [Sequelize.fn('avg', Sequelize.col('total')), 'avg']
      ],
      where: { status: 'completed' }
    });
    
    res.json({
      success: true,
      stats: {
        totalOrders,
        newOrders,
        completedOrders,
        totalRevenue: totalRevenue || 0,
        avgOrderValue: avgOrderValue.get('avg') || 0
      }
    });
    
  } catch (error) {
    console.error("Ошибка получения статистики:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при получении статистики" 
    });
  }
});

// Вспомогательная функция для получения текста статуса
function getStatusText(status) {
  const statusMap = {
    'new': 'Новый',
    'processing': 'В обработке',
    'completed': 'Завершен',
    'cancelled': 'Отменен',
    'all': 'Все'
  };
  return statusMap[status] || status;
}

// Маршруты
app.post('/api/create-order', requireAuth, async (req, res) => {
  try {
    const { 
      items, 
      total, 
      discount,
      customerData,
      deliveryData,
      paymentMethod
    } = req.body;

    // Валидация данных
    if (!items || !total || !customerData || !deliveryData) {
      return res.status(400).json({ 
        success: false,
        message: "Недостаточно данных для создания заказа" 
      });
    }

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      items: items,
      total: parseFloat(total),
      discount: parseFloat(discount || 0),
      customerName: customerData.name,
      customerPhone: customerData.phone,
      deliveryAddress: deliveryData.address,
      deliveryDate: new Date(`${deliveryData.date}T${deliveryData.time}:00`),
      deliveryComment: deliveryData.comment || '',
      paymentMethod: paymentMethod || 'cash',
      UserId: req.session.userId
    });

    res.json({ 
      success: true,
      orderNumber: order.orderNumber,
      redirectUrl: `/order-success.html?order=${order.orderNumber}`
    });

  } catch (error) {
    console.error("Ошибка создания заказа:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при создании заказа" 
    });
  }
});

app.get('/api/current-orders', requireAuth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { 
        UserId: req.session.userId,
        status: ['new', 'processing'] 
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Ошибка получения заказов:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при получении заказов" 
    });
  }
});

app.get('/api/order-history', requireAuth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { 
        UserId: req.session.userId,
        status: ['completed', 'cancelled'] 
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Ошибка получения истории заказов:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при получении истории заказов" 
    });
  }
});

app.post('/api/cancel-order/:id', requireAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ 
        success: false,
        message: "Укажите причину отмены" 
      });
    }

    const [updated] = await Order.update(
      { status: 'cancelled' },
      { where: { id: orderId, UserId: req.session.userId } }
    );

    if (updated) {
      res.json({ 
        success: true,
        message: "Заказ успешно отменен" 
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: "Заказ не найден" 
      });
    }
  } catch (error) {
    console.error("Ошибка отмены заказа:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при отмене заказа" 
    });
  }
});

app.get('/api/addresses', requireAuth, async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { UserId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ success: true, addresses });
  } catch (error) {
    console.error("Ошибка получения адресов:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при получении адресов" 
    });
  }
});

app.post('/api/add-address', requireAuth, async (req, res) => {
  try {
    const { name, city, street, house, apartment, comment } = req.body;
    
    if (!name || !city || !street || !house) {
      return res.status(400).json({ 
        success: false,
        message: "Обязательные поля: название, город, улица, дом" 
      });
    }

    const address = await Address.create({
      name,
      city,
      street,
      house,
      apartment,
      comment,
      UserId: req.session.userId
    });

    res.json({ 
      success: true,
      message: "Адрес успешно добавлен",
      address
    });
  } catch (error) {
    console.error("Ошибка добавления адреса:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при добавлении адреса" 
    });
  }
});

app.delete('/api/delete-address/:id', requireAuth, async (req, res) => {
  try {
    const addressId = req.params.id;
    
    const deleted = await Address.destroy({
      where: { id: addressId, UserId: req.session.userId }
    });

    if (deleted) {
      res.json({ 
        success: true,
        message: "Адрес успешно удален" 
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: "Адрес не найден" 
      });
    }
  } catch (error) {
    console.error("Ошибка удаления адреса:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при удалении адреса" 
    });
  }
});
// Добавьте этот маршрут перед app.listen
app.get('/admin.html', async (req, res) => {
  if (!req.session.isAdmin) {
    return res.redirect('/login.html');
  }
  
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login.html');
    }
    
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/user', requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'login', 'fullName', 'phone', 'email', 'role']
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      user,
      isAdmin: req.session.isAdmin || user.role === 'admin'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { login, password, fullName, phone, email } = req.body;

    if (!login || !password || !fullName || !phone || !email) {
      return res.status(400).json({ 
        success: false,
        message: "Все поля обязательны для заполнения" 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Неверный формат email" 
      });
    }

    const existingUser = await User.findOne({ where: { login } });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: "Пользователь с таким логином уже существует" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ 
      login, 
      password: hashedPassword, 
      fullName, 
      phone, 
      email 
    });

    res.status(201).json({ 
      success: true,
      message: "Регистрация прошла успешно! Теперь вы можете войти.",
      redirectUrl: "/login.html"
    });

  } catch (error) {
    console.error("Ошибка регистрации:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при регистрации. Пожалуйста, попробуйте позже." 
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Логин и пароль обязательны" 
      });
    }

    // Проверка администратора
    if (login === 'adminka' && password === 'password') {
      req.session.userId = 1;
      req.session.userName = 'Admin';
      req.session.isAdmin = true;
      
      return res.json({ 
        success: true,
        isAdmin: true,
        redirectUrl: "/admin.html"
      });
    }

    const user = await User.findOne({ where: { login } });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Пользователь с таким логином не найден" 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: "Неверный пароль" 
      });
    }

    req.session.userId = user.id;
    req.session.userName = user.fullName;
    req.session.isAdmin = user.role === 'admin';

    res.json({ 
      success: true,
      isAdmin: false,
      userName: user.fullName,
      redirectUrl: "/cabinet.html"
    });

  } catch (error) {
    console.error("Ошибка авторизации:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при авторизации. Пожалуйста, попробуйте позже." 
    });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Ошибка при выходе' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, redirectUrl: '/' });
  });
});

app.post('/api/update-profile', requireAuth, async (req, res) => {
  try {
    const { fullName, phone, email } = req.body;
    
    if (!fullName || !phone || !email) {
      return res.status(400).json({ 
        success: false,
        message: "Все поля обязательны для заполнения" 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Неверный формат email" 
      });
    }

    const [updated] = await User.update(
      { fullName, phone, email },
      { where: { id: req.session.userId } }
    );

    if (updated) {
      req.session.userName = fullName;
      return res.json({ 
        success: true,
        message: "Данные успешно обновлены" 
      });
    } else {
      return res.status(404).json({ 
        success: false,
        message: "Пользователь не найден" 
      });
    }
  } catch (error) {
    console.error("Ошибка обновления профиля:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при обновлении данных" 
    });
  }
});

app.post('/api/update-settings', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, emailNotifications, smsNotifications } = req.body;
    
    if (newPassword) {
      const user = await User.findByPk(req.session.userId);
      
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ 
          success: false,
          message: "Неверный текущий пароль" 
        });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });
    }
    
    res.json({ 
      success: true,
      message: "Настройки успешно обновлены" 
    });
  } catch (error) {
    console.error("Ошибка обновления настроек:", error);
    res.status(500).json({ 
      success: false,
      message: "Произошла ошибка при обновлении настроек" 
    });
  }
});

// Добавим в server.js новые маршруты для отзывов

// Получение отзывов
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [{
                model: User,
                attributes: ['id', 'fullName', 'email', 'avatar']
            }],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        const formattedReviews = reviews.map(review => {
            // Если у пользователя нет аватара, используем граватар
            let avatarUrl = review.User.avatar;
            if (!avatarUrl && review.User.email) {
                const emailHash = crypto.createHash('md5').update(review.User.email).digest('hex');
                avatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;
            }

            return {
                id: review.id,
                rating: review.rating,
                text: review.text,
                createdAt: review.createdAt,
                user: {
                    id: review.User.id,
                    fullName: review.User.fullName,
                    avatar: avatarUrl
                }
            };
        });

        res.json({ 
            success: true,
            reviews: formattedReviews 
        });
    } catch (error) {
        console.error("Ошибка получения отзывов:", error);
        res.status(500).json({ 
            success: false,
            message: "Произошла ошибка при получении отзывов" 
        });
    }
});

// Добавление отзыва
app.post('/api/reviews', requireAuth, async (req, res) => {
    try {
        const { rating, text } = req.body;
        
        // Проверка наличия обязательных полей
        if (!rating || !text) {
            return res.status(400).json({ 
                success: false,
                message: "Рейтинг и текст отзыва обязательны" 
            });
        }
        
        // Проверка, совершал ли пользователь покупки
        const hasOrders = await Order.findOne({
            where: { 
                UserId: req.session.userId,
                status: 'completed' 
            }
        });
        
        if (!hasOrders) {
            return res.status(403).json({ 
                success: false,
                message: "Вы можете оставить отзыв только после совершения покупки" 
            });
        }
        
        // Создание отзыва
        const review = await Review.create({
            rating,
            text,
            UserId: req.session.userId
        });
        
        // Получаем данные пользователя для ответа
        const user = await User.findByPk(req.session.userId, {
            attributes: ['id', 'fullName', 'email', 'avatar']
        });
        
        // Если у пользователя нет аватара, используем граватар
        let avatarUrl = user.avatar;
        if (!avatarUrl && user.email) {
            const emailHash = crypto.createHash('md5').update(user.email).digest('hex');
            avatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;
        }
        
        res.json({ 
            success: true,
            message: "Отзыв успешно добавлен",
            review: {
                id: review.id,
                rating: review.rating,
                text: review.text,
                createdAt: review.createdAt,
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    avatar: avatarUrl
                }
            }
        });
        
    } catch (error) {
        console.error("Ошибка добавления отзыва:", error);
        res.status(500).json({ 
            success: false,
            message: "Произошла ошибка при добавлении отзыва" 
        });
    }
});




// Sync database and start server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Ошибка синхронизации с базой данных:', err);
});
