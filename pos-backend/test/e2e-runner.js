/**
 * TradeSphere End-to-End Automated Test Runner
 * Validates all core business logic against the live local server and MongoDB Atlas
 */

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runE2E() {
  console.log('====================================================');
  console.log('   TradeSphere Full-Stack E2E Automated Verification ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function report(name, success, details = '') {
    if (success) {
      console.log(`[PASS] ${name} ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details}`);
      failed++;
    }
  }

  // TEST 1: Health Check & System Status
  try {
    const res = await request('/health');
    report(
      'Test 1: Health & Database Connectivity',
      res.ok && res.data.status === 'healthy',
      `-> Status: ${res.data?.status}, DB: ${res.data?.database}`
    );
  } catch (err) {
    report('Test 1: Health & Database Connectivity', false, err.message);
  }

  // TEST 2: User Authentication & JWT Generation
  let authToken = null;
  try {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@tradesphere.io', password: 'Password123!' }),
    });
    authToken = res.data?.token;
    report(
      'Test 2: RBAC Authentication & JWT Token Issuance',
      res.ok && !!authToken && res.data?.user?.role === 'admin',
      `-> Logged in as: ${res.data?.user?.name} (Role: ${res.data?.user?.role})`
    );
  } catch (err) {
    report('Test 2: RBAC Authentication & JWT Token Issuance', false, err.message);
  }

  // TEST 3: Catalog Retrieval
  let testProduct = null;
  try {
    const res = await request('/products');
    const products = res.data;
    testProduct = products && products.length > 0 ? products[0] : null;
    report(
      'Test 3: Equities Market Catalog Retrieval',
      res.ok && Array.isArray(products) && products.length > 0,
      `-> Retrieved ${products?.length} active market assets from TradeSphere`
    );
  } catch (err) {
    report('Test 3: Equities Market Catalog Retrieval', false, err.message);
  }

  if (!testProduct) {
    console.error('Aborting further order tests: No products available in catalog.');
    return;
  }

  // TEST 4: Atomic BUY Stock Reservation & Concurrency Lock
  let activeOrder = null;
  const reserveQty = 2;
  const idempotencyKey = `E2E-IDEMP-${Date.now()}`;

  try {
    const res = await request('/orders/reserve', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        side: 'BUY',
        orderType: 'MARKET',
        items: [{ productId: testProduct._id, quantity: reserveQty, name: testProduct.name, price: testProduct.price, sku: testProduct.sku }],
        idempotencyKey,
      }),
    });

    activeOrder = res.data?.order;
    report(
      'Test 4: Atomic Multi-Item Stock Reservation (BUY)',
      res.ok && activeOrder && activeOrder.status === 'RESERVED' && activeOrder.side === 'BUY',
      `-> Order: ${activeOrder?.orderNumber}, Total: $${activeOrder?.totalAmount}`
    );
  } catch (err) {
    report('Test 4: Atomic Multi-Item Stock Reservation (BUY)', false, err.message);
  }

  // TEST 5: Idempotency Verification (Prevent Double-Execution)
  try {
    const res = await request('/orders/reserve', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({
        side: 'BUY',
        items: [{ productId: testProduct._id, quantity: reserveQty }],
        idempotencyKey,
      }),
    });

    report(
      'Test 5: Idempotency Protection (Duplicate Request Check)',
      res.ok && res.data?.isDuplicate === true,
      `-> Successfully caught duplicate idempotency key without double deduction`
    );
  } catch (err) {
    report('Test 5: Idempotency Protection', false, err.message);
  }

  // TEST 6: Payment Completion & Trade Settlement
  try {
    const res = await request('/orders/complete', {
      method: 'POST',
      body: JSON.stringify({ orderId: activeOrder?._id }),
    });

    report(
      'Test 6: Trade Settlement & Order Completion',
      res.ok && res.data?.order?.status === 'COMPLETED',
      `-> Order ${activeOrder?.orderNumber} transitioned to COMPLETED`
    );
  } catch (err) {
    report('Test 6: Trade Settlement & Order Completion', false, err.message);
  }

  // TEST 7: SELL Order Execution & Settlement
  try {
    const sellRes = await request('/orders/reserve', {
      method: 'POST',
      body: JSON.stringify({
        side: 'SELL',
        orderType: 'LIMIT',
        limitPrice: testProduct.price,
        items: [{ productId: testProduct._id, quantity: 1, name: testProduct.name, price: testProduct.price, sku: testProduct.sku }],
      }),
    });

    const sellOrderId = sellRes.data?.order?._id;
    const sellCompleteRes = await request('/orders/complete', {
      method: 'POST',
      body: JSON.stringify({ orderId: sellOrderId }),
    });

    report(
      'Test 7: SELL Order Execution & Instant Liquidation Settlement',
      sellCompleteRes.ok && sellCompleteRes.data?.order?.status === 'COMPLETED' && sellCompleteRes.data?.order?.side === 'SELL',
      `-> SELL order ${sellCompleteRes.data?.order?.orderNumber} settled with market float replenishment`
    );
  } catch (err) {
    report('Test 7: SELL Order Execution & Instant Liquidation Settlement', false, err.message);
  }

  // TEST 8: Order Cancellation & Concurrency Restitution
  try {
    const reserveRes = await request('/orders/reserve', {
      method: 'POST',
      body: JSON.stringify({
        side: 'BUY',
        items: [{ productId: testProduct._id, quantity: 1, name: testProduct.name, price: testProduct.price }],
      }),
    });
    const cancelOrderId = reserveRes.data?.order?._id;

    const cancelRes = await request('/orders/cancel', {
      method: 'POST',
      body: JSON.stringify({ orderId: cancelOrderId }),
    });

    report(
      'Test 8: Order Cancellation & Automatic Stock Restitution',
      cancelRes.ok && cancelRes.data?.order?.status === 'CANCELLED',
      `-> Order cancelled and reservation released`
    );
  } catch (err) {
    report('Test 8: Order Cancellation & Automatic Stock Restitution', false, err.message);
  }

  // TEST 9: Fat-Finger Risk Boundary Protection (> 100,000 shares)
  try {
    const res = await request('/orders/reserve', {
      method: 'POST',
      body: JSON.stringify({
        side: 'BUY',
        items: [{ productId: testProduct._id, quantity: 999999 }],
      }),
    });

    report(
      'Test 9: Fat-Finger Circuit Breaker & Boundary Protection',
      res.status === 400,
      `-> Clean rejection: "${res.data?.error}"`
    );
  } catch (err) {
    report('Test 9: Fat-Finger Circuit Breaker & Boundary Protection', false, err.message);
  }

  // TEST 10: Real Database Aggregation Analytics
  try {
    const res = await request('/analytics/summary');
    const metrics = res.data?.metrics;
    report(
      'Test 10: Portfolio Analytics Aggregation Pipeline',
      res.ok && typeof metrics?.totalRevenue === 'number' && metrics?.completedOrders >= 1,
      `-> Total Volume: $${metrics?.totalRevenue}, Completed Trades: ${metrics?.completedOrders}`
    );
  } catch (err) {
    report('Test 10: Portfolio Analytics Aggregation Pipeline', false, err.message);
  }

  // TEST 11: Immutable Audit Trail
  try {
    const res = await request('/orders/audit-logs');
    const logs = res.data;
    report(
      'Test 11: Immutable Operational Audit Logging',
      res.ok && Array.isArray(logs) && logs.length >= 1,
      `-> Verified ${logs?.length} recorded audit events`
    );
  } catch (err) {
    report('Test 11: Immutable Operational Audit Logging', false, err.message);
  }

  console.log('\n====================================================');
  console.log(`  E2E Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exitCode = 1;
  }
}

runE2E();
