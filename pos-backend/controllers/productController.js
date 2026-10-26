const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

const DEFAULT_STOCKS = [
  { _id: 'stock-rel-01', name: 'Reliance Industries Ltd', sku: 'RELIANCE', category: 'Energy & Retail', price: 2892.45, stock: 500, lowStockThreshold: 20, isActive: true },
  { _id: 'stock-tcs-02', name: 'Tata Consultancy Services', sku: 'TCS', category: 'Technology', price: 4123.80, stock: 450, lowStockThreshold: 15, isActive: true },
  { _id: 'stock-hdfc-03', name: 'HDFC Bank Ltd', sku: 'HDFCBANK', category: 'Banking', price: 1678.90, stock: 800, lowStockThreshold: 30, isActive: true },
  { _id: 'stock-infy-04', name: 'Infosys Ltd', sku: 'INFY', category: 'Technology', price: 1456.20, stock: 900, lowStockThreshold: 25, isActive: true },
  { _id: 'stock-icici-05', name: 'ICICI Bank Ltd', sku: 'ICICIBANK', category: 'Banking', price: 1234.50, stock: 750, lowStockThreshold: 25, isActive: true },
  { _id: 'stock-aapl-06', name: 'Apple Inc.', sku: 'AAPL', category: 'Technology', price: 188.50, stock: 1200, lowStockThreshold: 50, isActive: true },
  { _id: 'stock-msft-07', name: 'Microsoft Corporation', sku: 'MSFT', category: 'Technology', price: 412.30, stock: 1000, lowStockThreshold: 40, isActive: true },
  { _id: 'stock-googl-08', name: 'Alphabet Inc.', sku: 'GOOGL', category: 'Technology', price: 145.20, stock: 1500, lowStockThreshold: 50, isActive: true },
  { _id: 'stock-amzn-09', name: 'Amazon.com Inc.', sku: 'AMZN', category: 'Consumer Cyclical', price: 178.90, stock: 1100, lowStockThreshold: 45, isActive: true },
  { _id: 'stock-nvda-10', name: 'NVIDIA Corporation', sku: 'NVDA', category: 'Semiconductors', price: 875.30, stock: 600, lowStockThreshold: 20, isActive: true },
  { _id: 'stock-tsla-11', name: 'Tesla Inc.', sku: 'TSLA', category: 'Automotive', price: 248.50, stock: 850, lowStockThreshold: 30, isActive: true },
  { _id: 'stock-sbin-12', name: 'State Bank of India', sku: 'SBIN', category: 'Banking', price: 612.40, stock: 1400, lowStockThreshold: 50, isActive: true },
  { _id: 'stock-bajf-13', name: 'Bajaj Finance Ltd', sku: 'BAJFINANCE', category: 'Financial Services', price: 6789.20, stock: 300, lowStockThreshold: 10, isActive: true },
  { _id: 'stock-hul-14', name: 'Hindustan Unilever Ltd', sku: 'HINDUNILVR', category: 'Consumer Goods', price: 2456.90, stock: 400, lowStockThreshold: 15, isActive: true },
];

// In-memory catalog store for resilient local offline development
let inMemoryStocks = [...DEFAULT_STOCKS];

// 1. Get all products with search & category filtering
const getProducts = async (req, res) => {
  try {
    const { search, category, lowStock } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (req.dbConnected) {
      try {
        const products = await Product.find(query).sort({ createdAt: -1 });
        if (products && products.length > 0) {
          const filtered = lowStock === 'true'
            ? products.filter((p) => p.stock <= p.lowStockThreshold)
            : products;
          return res.json(filtered);
        }
      } catch (dbErr) {
        console.warn('[TradeSphere] Live DB query error, serving resilient equities catalog');
      }
    }

    // Graceful fallback from inMemoryStocks
    let results = inMemoryStocks.filter((s) => s.isActive);
    if (search) {
      const sLower = search.toLowerCase();
      results = results.filter((s) => s.name.toLowerCase().includes(sLower) || s.sku.toLowerCase().includes(sLower));
    }
    if (category && category !== 'All') {
      results = results.filter((s) => s.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (lowStock === 'true') {
      results = results.filter((s) => s.stock <= s.lowStockThreshold);
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assets/stocks: ' + err.message });
  }
};

// 2. Get single product
const getProductById = async (req, res) => {
  try {
    if (req.dbConnected) {
      try {
        const product = await Product.findById(req.params.id);
        if (product && product.isActive) {
          return res.json(product);
        }
      } catch (dbErr) {
        // Fallback
      }
    }

    const found = inMemoryStocks.find((s) => s._id === req.params.id || s.sku === req.params.id);
    if (!found) {
      return res.status(404).json({ error: 'Stock/Asset not found' });
    }
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching stock/asset: ' + err.message });
  }
};

// 3. Create new product (Stock/Asset)
const createProduct = async (req, res) => {
  try {
    const { name, price, stock, category, sku, lowStockThreshold } = req.body;

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedThreshold = lowStockThreshold ? Number(lowStockThreshold) : 5;

    if (!name || isNaN(parsedPrice) || isNaN(parsedStock)) {
      return res.status(400).json({
        error: 'Invalid input: Please provide a valid Name, Price, and Available Shares/Stock.',
      });
    }

    if (parsedPrice < 0 || parsedStock < 0) {
      return res.status(400).json({
        error: 'Price and Shares cannot be negative numbers.',
      });
    }

    const generatedSku = (sku || `STK-${Date.now().toString().slice(-5)}`).toUpperCase();

    if (req.dbConnected) {
      try {
        const product = new Product({
          name: name.trim(),
          sku: generatedSku,
          category: category ? category.trim() : 'General',
          price: parsedPrice,
          stock: parsedStock,
          lowStockThreshold: parsedThreshold,
        });

        await product.save();

        await AuditLog.create({
          action: 'STOCK_ADDED',
          entityType: 'PRODUCT',
          entityId: product._id.toString(),
          description: `New stock/asset listed: "${product.name}" (${product.sku}) at $${product.price}, Available: ${product.stock} shares`,
          metadata: { name: product.name, price: product.price, stock: product.stock, sku: product.sku },
          performedBy: req.user ? `${req.user.name} (${req.user.role})` : 'Anonymous / Trader',
          ipAddress: req.ip,
        }).catch(() => null);

        return res.status(201).json(product);
      } catch (dbErr) {
        // Fallback to in-memory store
      }
    }

    // In-memory fallback
    const mockProduct = {
      _id: `stock-${Date.now()}`,
      name: name.trim(),
      sku: generatedSku,
      category: category ? category.trim() : 'General',
      price: parsedPrice,
      stock: parsedStock,
      reservedStock: 0,
      lowStockThreshold: parsedThreshold,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    inMemoryStocks.unshift(mockProduct);
    return res.status(201).json(mockProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create stock/asset: ' + err.message });
  }
};

// 4. Update product
const updateProduct = async (req, res) => {
  try {
    const { name, price, stock, category, lowStockThreshold } = req.body;

    try {
      const product = await Product.findById(req.params.id);
      if (product) {
        const previousStock = product.stock;
        if (name !== undefined) product.name = name.trim();
        if (price !== undefined) product.price = Number(price);
        if (stock !== undefined) product.stock = Number(stock);
        if (category !== undefined) product.category = category.trim();
        if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);

        await product.save();
        return res.json(product);
      }
    } catch (dbErr) {
      // fallback
    }

    const idx = inMemoryStocks.findIndex((s) => s._id === req.params.id);
    if (idx !== -1) {
      if (name !== undefined) inMemoryStocks[idx].name = name.trim();
      if (price !== undefined) inMemoryStocks[idx].price = Number(price);
      if (stock !== undefined) inMemoryStocks[idx].stock = Number(stock);
      return res.json(inMemoryStocks[idx]);
    }

    return res.status(404).json({ error: 'Stock/Asset not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stock/asset: ' + err.message });
  }
};

// 5. Delete product (soft-delete / archive)
const deleteProduct = async (req, res) => {
  try {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      if (product) {
        return res.json({ message: 'Stock archived successfully', product });
      }
    } catch (dbErr) {
      // fallback
    }

    const idx = inMemoryStocks.findIndex((s) => s._id === req.params.id);
    if (idx !== -1) {
      inMemoryStocks[idx].isActive = false;
      return res.json({ message: 'Stock archived successfully', product: inMemoryStocks[idx] });
    }

    return res.status(404).json({ error: 'Stock/Asset not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete stock/asset: ' + err.message });
  }
};

// 6. Seed demo stocks/equities matching TradeSphere market portfolio
const seedProducts = async (req, res) => {
  try {
    try {
      const count = await Product.countDocuments({ isActive: true });
      if (count > 0) {
        return res.json({ message: `Database already has ${count} stocks/assets.` });
      }

      const inserted = await Product.insertMany(DEFAULT_STOCKS.map(({ _id, ...rest }) => rest));
      return res.status(201).json({ message: `Successfully seeded ${inserted.length} TradeSphere market equities.`, inserted });
    } catch (dbErr) {
      // fallback
    }

    inMemoryStocks = [...DEFAULT_STOCKS];
    res.json({ message: `Successfully initialized ${inMemoryStocks.length} TradeSphere market equities.`, count: inMemoryStocks.length });
  } catch (err) {
    res.status(500).json({ error: 'Seeding stocks failed: ' + err.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts,
  DEFAULT_STOCKS,
};
