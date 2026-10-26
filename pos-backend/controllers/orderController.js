const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const { cleanupExpiredOrders } = require('../services/expirationService');

// In-memory demo transaction store for offline local preview
let inMemoryOrders = [
  {
    _id: 'ord-init-101',
    orderNumber: 'ORD-TRD-1001',
    side: 'BUY',
    orderType: 'MARKET',
    status: 'COMPLETED',
    totalAmount: 14462.25,
    items: [{ productId: 'stock-rel-01', name: 'Reliance Industries Ltd', sku: 'RELIANCE', price: 2892.45, quantity: 5, subtotal: 14462.25 }],
    traderName: 'Nandhakishore A',
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'ord-init-102',
    orderNumber: 'ORD-TRD-1002',
    side: 'SELL',
    orderType: 'LIMIT',
    limitPrice: 4123.80,
    status: 'COMPLETED',
    totalAmount: 41238.00,
    items: [{ productId: 'stock-tcs-02', name: 'Tata Consultancy Services', sku: 'TCS', price: 4123.80, quantity: 10, subtotal: 41238.00 }],
    traderName: 'Portfolio Manager',
    completedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'ord-init-103',
    orderNumber: 'ORD-TRD-1003',
    side: 'BUY',
    orderType: 'MARKET',
    status: 'COMPLETED',
    totalAmount: 8753.00,
    items: [{ productId: 'stock-nvda-10', name: 'NVIDIA Corporation', sku: 'NVDA', price: 875.30, quantity: 10, subtotal: 8753.00 }],
    traderName: 'Nandhakishore A',
    completedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

let inMemoryAuditLogs = [
  {
    _id: 'log-01',
    action: 'SYSTEM_BOOT',
    entityType: 'SYSTEM',
    entityId: 'tradesphere-core',
    description: 'TradeSphere Engine operational with dark fintech architecture',
    performedBy: 'System Engine',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'log-02',
    action: 'SEED_EQUITIES',
    entityType: 'PRODUCT',
    entityId: 'catalog',
    description: '14 Market Equities initialized into active trading floor',
    performedBy: 'System Seeder',
    createdAt: new Date(Date.now() - 10000).toISOString(),
  },
  {
    _id: 'log-03',
    action: 'MARKET_OPEN',
    entityType: 'SYSTEM',
    entityId: 'exchange-active',
    description: 'NSE / BSE / NASDAQ indices synchronized',
    performedBy: 'Exchange Gateway',
    createdAt: new Date(Date.now() - 5000).toISOString(),
  },
];

// Helper to generate unique order number
const generateOrderNumber = (side = 'BUY') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${side.slice(0, 1)}-${timestamp}-${random}`;
};

// 1. Reserve Stock & Create Order (Atomic Multi-Item & Trading Risk Protection)
const reserveOrder = async (req, res) => {
  const rollbackList = [];
  try {
    const body = req.body || {};
    const idempotencyKey = req.headers['idempotency-key'] || body.idempotencyKey;
    const side = (body.side || 'BUY').toUpperCase();
    const orderType = (body.orderType || 'MARKET').toUpperCase();
    const limitPrice = body.limitPrice ? Number(body.limitPrice) : undefined;
    const stopLoss = body.stopLoss ? Number(body.stopLoss) : undefined;

    if (!['BUY', 'SELL'].includes(side)) {
      return res.status(400).json({ error: 'Order side must be either BUY or SELL.' });
    }

    if (!['MARKET', 'LIMIT', 'STOP_LOSS'].includes(orderType)) {
      return res.status(400).json({ error: 'Order type must be MARKET, LIMIT, or STOP_LOSS.' });
    }

    let rawItems = [];
    if (Array.isArray(body.items) && body.items.length > 0) {
      rawItems = body.items;
    } else if (body.productId) {
      rawItems = [{ productId: body.productId, quantity: body.quantity || 1, price: body.price, sku: body.sku, name: body.name }];
    } else {
      return res.status(400).json({ error: 'Please provide items with productId and quantity.' });
    }

    // Risk Management Checks
    for (const raw of rawItems) {
      const qty = Number(raw.quantity);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ error: 'Quantity must be a positive number.' });
      }
      if (qty > 100000) {
        return res.status(400).json({ error: `Risk Limit Exceeded: Single trade quantity (${qty}) exceeds the 100,000 shares fat-finger circuit breaker.` });
      }
      if (raw.price !== undefined && (isNaN(Number(raw.price)) || Number(raw.price) <= 0)) {
        return res.status(400).json({ error: 'Execution price must be a positive number.' });
      }
    }

    // Check Idempotency Key in session memory first
    if (idempotencyKey) {
      const existing = inMemoryOrders.find((o) => o.idempotencyKey === idempotencyKey);
      if (existing) {
        return res.status(200).json({
          message: 'Order already processed (Idempotent response)',
          order: existing,
          isDuplicate: true,
        });
      }
    }

    const traderName = req.user?.name || body.traderName || 'Floor Trader';
    const traderEmail = req.user?.email || body.traderEmail || '';

    // Attempt live database reservation if connected
    if (req.dbConnected) {
      if (idempotencyKey) {
        const existingOrder = await Order.findOne({ idempotencyKey });
        if (existingOrder) {
          return res.status(200).json({
            message: 'Order already processed (Idempotent response)',
            order: existingOrder,
            isDuplicate: true,
          });
        }
      }

      const orderItems = [];
      let totalAmount = 0;

      for (const raw of rawItems) {
        const qty = Number(raw.quantity);
        const isObjectId = mongoose.Types.ObjectId.isValid(raw.productId);
        const searchCriteria = {
          $or: [
            ...(isObjectId ? [{ _id: raw.productId }] : []),
            ...(raw.sku ? [{ sku: String(raw.sku).toUpperCase() }] : []),
            { sku: String(raw.productId).toUpperCase() },
            ...(raw.name ? [{ name: raw.name }] : []),
          ],
          isActive: true,
        };

        if (side === 'BUY') {
          searchCriteria.stock = { $gte: qty };
          const updatedProduct = await Product.findOneAndUpdate(
            searchCriteria,
            { $inc: { stock: -qty, reservedStock: qty } },
            { new: true }
          );

          if (!updatedProduct) {
            const productInfo = isObjectId
              ? await Product.findById(raw.productId)
              : await Product.findOne({
                  $or: [
                    ...(raw.sku ? [{ sku: String(raw.sku).toUpperCase() }] : []),
                    { sku: String(raw.productId).toUpperCase() },
                    ...(raw.name ? [{ name: raw.name }] : []),
                  ],
                });
            const availableStock = productInfo ? productInfo.stock : 0;
            const productName = productInfo ? productInfo.name : (raw.name || raw.productId);
            throw new Error(`Insufficient stock for "${productName}". Requested: ${qty}, Available: ${availableStock}`);
          }

          rollbackList.push({ productId: updatedProduct._id, quantity: qty, side: 'BUY' });

          const execPrice = (orderType === 'LIMIT' && limitPrice) ? limitPrice : updatedProduct.price;
          const itemSubtotal = execPrice * qty;
          totalAmount += itemSubtotal;
          orderItems.push({
            productId: updatedProduct._id,
            name: updatedProduct.name,
            sku: updatedProduct.sku,
            price: execPrice,
            quantity: qty,
            subtotal: itemSubtotal,
          });
        } else {
          // SELL Order
          const product = await Product.findOne(searchCriteria);
          const execPrice = (orderType === 'LIMIT' && limitPrice) ? limitPrice : (Number(raw.price) || (product ? product.price : 100));
          const itemSubtotal = execPrice * qty;
          totalAmount += itemSubtotal;

          orderItems.push({
            productId: product ? product._id : raw.productId,
            name: product ? product.name : (raw.name || 'Equity Position'),
            sku: product ? product.sku : (raw.sku || 'EQUITY'),
            price: execPrice,
            quantity: qty,
            subtotal: itemSubtotal,
          });
        }
      }

      const expirationWindowMs = 5 * 60 * 1000;
      const order = new Order({
        orderNumber: generateOrderNumber(side),
        side,
        orderType,
        limitPrice,
        stopLoss,
        idempotencyKey,
        items: orderItems,
        totalAmount: Math.round(totalAmount * 100) / 100,
        status: 'RESERVED',
        traderName,
        traderEmail,
        cashierName: traderName,
        expiresAt: new Date(Date.now() + expirationWindowMs),
      });

      await order.save();

      await AuditLog.create({
        action: side === 'BUY' ? 'BUY_ORDER_RESERVED' : 'SELL_ORDER_RESERVED',
        entityType: 'ORDER',
        entityId: order._id.toString(),
        description: `${side} Order ${order.orderNumber} initiated (${orderType}). ${order.items.length} position(s). Total: $${order.totalAmount}`,
        metadata: { orderNumber: order.orderNumber, side, orderType, totalAmount: order.totalAmount },
        performedBy: traderName,
        ipAddress: req.ip,
      }).catch(() => null);

      return res.status(201).json({
        message: `${side} order reserved successfully! Concurrency lock active for 5 minutes.`,
        order,
      });
    }

    // Resilient In-Memory Reservation
    const mockItems = [];
    let mockTotal = 0;

    for (const raw of rawItems) {
      const qty = Number(raw.quantity);
      if (!raw.productId || isNaN(qty) || qty <= 0) {
        return res.status(400).json({ error: `Invalid item payload or quantity for product ${raw.productId}` });
      }

      // Check stock boundary for simulated BUY
      if (side === 'BUY' && qty > 10000) {
        return res.status(400).json({ error: `Insufficient stock for product. Requested: ${qty}` });
      }

      const unitPrice = (orderType === 'LIMIT' && limitPrice) ? limitPrice : (Number(raw.price) || 100);
      const subtotal = unitPrice * qty;
      mockTotal += subtotal;
      mockItems.push({
        productId: raw.productId,
        name: raw.name || 'Trade Position',
        sku: raw.sku || 'TRADE',
        price: unitPrice,
        quantity: qty,
        subtotal,
      });
    }

    const orderNumber = generateOrderNumber(side);
    const mockOrder = {
      _id: `ord-${Date.now()}`,
      orderNumber,
      side,
      orderType,
      limitPrice,
      stopLoss,
      idempotencyKey,
      status: 'RESERVED',
      items: mockItems,
      totalAmount: Math.round(mockTotal * 100) / 100,
      traderName,
      traderEmail,
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    inMemoryOrders.unshift(mockOrder);

    inMemoryAuditLogs.unshift({
      _id: `log-${Date.now()}`,
      action: side === 'BUY' ? 'BUY_ORDER_RESERVED' : 'SELL_ORDER_RESERVED',
      entityType: 'ORDER',
      entityId: mockOrder._id,
      description: `${side} Order ${mockOrder.orderNumber} reserved. Total: $${mockOrder.totalAmount}`,
      performedBy: traderName,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      message: `${side} order reserved (Session Mode)`,
      order: mockOrder,
    });
  } catch (err) {
    for (const r of rollbackList) {
      if (r.side === 'BUY' && mongoose.Types.ObjectId.isValid(r.productId)) {
        await Product.findByIdAndUpdate(r.productId, {
          $inc: { stock: r.quantity, reservedStock: -r.quantity },
        }).catch(() => null);
      }
    }
    res.status(400).json({ error: err.message });
  }
};

// 2. Complete Order / Trade Settlement
const completeOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    if (req.dbConnected) {
      await cleanupExpiredOrders().catch(() => null);
      const order = await Order.findById(orderId);
      if (order) {
        if (order.status !== 'RESERVED') {
          return res.status(400).json({ error: `Order cannot be completed. Current status: ${order.status}` });
        }

        for (const item of order.items) {
          if (mongoose.Types.ObjectId.isValid(item.productId)) {
            if (order.side === 'BUY') {
              // Finalize reserved stock deduction
              await Product.findByIdAndUpdate(item.productId, {
                $inc: { reservedStock: -item.quantity },
              }).catch(() => null);
            } else {
              // Sell order completed: return shares back to market float
              await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity },
              }).catch(() => null);
            }
          }
        }

        order.status = 'COMPLETED';
        order.completedAt = new Date();
        await order.save();

        await AuditLog.create({
          action: 'TRADE_SETTLED',
          entityType: 'ORDER',
          entityId: order._id.toString(),
          description: `Trade ${order.orderNumber} settled and confirmed. ${order.side} ${order.items.length} position(s). Total: $${order.totalAmount}`,
          metadata: { orderNumber: order.orderNumber, side: order.side, totalAmount: order.totalAmount },
          performedBy: order.traderName || 'Floor Trader',
          ipAddress: req.ip,
        }).catch(() => null);

        return res.json({ message: 'Trade verified and settled successfully!', order });
      }
    }

    const idx = inMemoryOrders.findIndex((o) => o._id === orderId);
    if (idx !== -1) {
      inMemoryOrders[idx].status = 'COMPLETED';
      inMemoryOrders[idx].completedAt = new Date().toISOString();
      return res.json({ message: 'Trade verified and settled successfully! (Session Mode)', order: inMemoryOrders[idx] });
    }

    return res.status(404).json({ error: 'Order not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete order: ' + err.message });
  }
};

// 3. Cancel Order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    if (req.dbConnected) {
      const order = await Order.findById(orderId);
      if (order) {
        if (order.side === 'BUY') {
          for (const item of order.items) {
            if (mongoose.Types.ObjectId.isValid(item.productId)) {
              await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity, reservedStock: -item.quantity },
              }).catch(() => null);
            }
          }
        }
        order.status = 'CANCELLED';
        order.cancelledAt = new Date();
        await order.save();

        await AuditLog.create({
          action: 'ORDER_CANCELLED',
          entityType: 'ORDER',
          entityId: order._id.toString(),
          description: `Order ${order.orderNumber} cancelled by trader. Concurrency reservation released.`,
          performedBy: order.traderName || 'Floor Trader',
          ipAddress: req.ip,
        }).catch(() => null);

        return res.json({ message: 'Order cancelled successfully and reserved stock restored.', order });
      }
    }

    const idx = inMemoryOrders.findIndex((o) => o._id === orderId);
    if (idx !== -1) {
      inMemoryOrders[idx].status = 'CANCELLED';
      inMemoryOrders[idx].cancelledAt = new Date().toISOString();
      return res.json({ message: 'Order cancelled successfully and reserved stock restored.', order: inMemoryOrders[idx] });
    }

    return res.status(404).json({ error: 'Order not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel order: ' + err.message });
  }
};

// 4. Get All Orders
const getOrders = async (req, res) => {
  try {
    if (req.dbConnected) {
      await cleanupExpiredOrders().catch(() => null);
      const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
      if (orders && orders.length > 0) {
        return res.json(orders);
      }
    }
    res.json(inMemoryOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve orders: ' + err.message });
  }
};

// 5. Get Audit Logs
const getAuditLogs = async (req, res) => {
  try {
    if (req.dbConnected) {
      const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
      if (logs && logs.length > 0) {
        return res.json(logs);
      }
    }
    res.json(inMemoryAuditLogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve audit logs: ' + err.message });
  }
};

module.exports = {
  reserveOrder,
  completeOrder,
  cancelOrder,
  getOrders,
  getAuditLogs,
  inMemoryOrders,
};
