const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.static(path.join(__dirname)));

const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const initFile = (filePath, defaultData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
};

initFile(PRODUCTS_FILE, [
  {
    id: 1,
    title: "Heavyweight Oversized Acid-Wash Tee",
    category: "T-Shirts",
    price: 799,
    originalPrice: 1299,
    sizes: ["M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Korean Minimal Boxy Formal Shirt",
    category: "Shirts",
    price: 999,
    originalPrice: 1699,
    sizes: ["M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "Tactical Multi-Pocket Baggy Cargoes",
    category: "Bottomwear",
    price: 1299,
    originalPrice: 2199,
    sizes: ["M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80"
  }
]);
initFile(USERS_FILE, []);
initFile(ORDERS_FILE, []);

const readJson = (file) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return []; }
};

const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');

// Products API
app.get('/api/products', (req, res) => res.json(readJson(PRODUCTS_FILE)));

app.post('/api/products', (req, res) => {
  try {
    const list = readJson(PRODUCTS_FILE);
    const item = {
      id: Date.now(),
      title: req.body.title || "Streetwear Drop",
      category: req.body.category || "T-Shirts",
      price: Number(req.body.price) || 0,
      originalPrice: Number(req.body.originalPrice) || Number(req.body.price) || 0,
      sizes: req.body.sizes || ["M", "L", "XL"],
      image: req.body.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80"
    };
    list.push(item);
    writeJson(PRODUCTS_FILE, list);
    res.status(201).json(item);
  } catch {
    res.status(500).json({ error: "Failed to save product" });
  }
});

app.delete('/api/products/:id', (req, res) => {
  let list = readJson(PRODUCTS_FILE);
  list = list.filter(p => String(p.id) !== String(req.params.id));
  writeJson(PRODUCTS_FILE, list);
  res.json({ success: true });
});

// Auth API
app.post('/api/auth/login', (req, res) => {
  const { phone, pass } = req.body;
  const users = readJson(USERS_FILE);

  if (pass === "1s0k9j2d") {
    let admin = users.find(u => u.phone === phone) || {
      id: Date.now(), name: "Admin", phone, isAdmin: true, flag: "VIP", joinedDate: new Date().toISOString().slice(0, 10)
    };
    admin.isAdmin = true;
    if (!users.some(u => u.phone === phone)) users.push(admin);
    writeJson(USERS_FILE, users);
    return res.json(admin);
  }

  const user = users.find(u => u.phone === phone && u.pass === pass);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  res.json(user);
});

app.post('/api/auth/register', (req, res) => {
  const { name, phone, pass } = req.body;
  const users = readJson(USERS_FILE);
  if (users.some(u => u.phone === phone)) return res.status(400).json({ error: "Phone already exists" });

  const newUser = {
    id: Date.now(), name, phone, pass, isAdmin: false, flag: "Active", joinedDate: new Date().toISOString().slice(0, 10)
  };
  users.push(newUser);
  writeJson(USERS_FILE, users);
  res.status(201).json(newUser);
});

app.get('/api/users', (req, res) => res.json(readJson(USERS_FILE)));

app.patch('/api/users/:phone/flag', (req, res) => {
  const users = readJson(USERS_FILE);
  const u = users.find(x => x.phone === req.params.phone);
  if (u) {
    u.flag = req.body.flag || u.flag;
    writeJson(USERS_FILE, users);
  }
  res.json(u || {});
});

// Orders API
app.post('/api/orders', (req, res) => {
  const orders = readJson(ORDERS_FILE);
  const newOrder = {
    id: "FC-" + Math.floor(100000 + Math.random() * 900000),
    customerName: req.body.customer.name,
    customerPhone: req.body.customer.phone,
    address: req.body.customer.address,
    items: req.body.items,
    total: Number(req.body.total) || 0,
    status: "Placed",
    date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };
  orders.push(newOrder);
  writeJson(ORDERS_FILE, orders);
  res.status(201).json(newOrder);
});

app.get('/api/orders', (req, res) => res.json(readJson(ORDERS_FILE)));
app.get('/api/orders/:id', (req, res) => {
  const order = readJson(ORDERS_FILE).find(o => o.id.toUpperCase() === req.params.id.toUpperCase());
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const orders = readJson(ORDERS_FILE);
  const o = orders.find(x => x.id.toUpperCase() === req.params.id.toUpperCase());
  if (o) {
    o.status = req.body.status;
    writeJson(ORDERS_FILE, orders);
  }
  res.json(o || {});
});

app.get('/api/admin/analytics', (req, res) => {
  const users = readJson(USERS_FILE);
  const orders = readJson(ORDERS_FILE);
  res.json(users.map(u => {
    const userOrders = orders.filter(o => o.customerPhone === u.phone);
    return {
      name: u.name,
      phone: u.phone,
      joinedDate: u.joinedDate || "N/A",
      flag: u.flag || "Active",
      totalOrders: userOrders.length,
      totalSpent: userOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
    };
  }));
});

app.use((req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => console.log(`FIT CHECK running at http://localhost:${PORT}`));