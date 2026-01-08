import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://frontend:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Use Docker service names when running in containers, localhost for local dev
const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL ||
  (process.env.NODE_ENV === 'production' ? 'http://product_service:8000' : 'http://localhost:8000');
const USER_SERVICE = process.env.USER_SERVICE_URL ||
  (process.env.NODE_ENV === 'production' ? 'http://user_service:4000' : 'http://localhost:4000');
const ORDER_SERVICE = process.env.ORDER_SERVICE_URL ||
  (process.env.NODE_ENV === 'production' ? 'http://orderservice:8085' : 'http://localhost:8085');

/**
 * PRODUCT PROXY
 * NOTE: no pathRewrite here
 */
const productProxy = createProxyMiddleware({
  target: PRODUCT_SERVICE,
  changeOrigin: true,
  logLevel: 'debug', // runtime logging only, TS-safe
});

/**
 * USER PROXY
 */
const userProxy = createProxyMiddleware({
  target: USER_SERVICE,
  changeOrigin: true,
  logLevel: 'debug',
  timeout: 30000,
  proxyTimeout: 30000,

  onError: (err, req, res) => {
    console.error('[HPM] Proxy error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Service unavailable' });
    }
  },

  onProxyReq: (proxyReq, req) => {
    console.log(
      `[HPM] ${req.method} ${req.originalUrl} → ${USER_SERVICE}${proxyReq.path}`
    );
  },

  onProxyRes: (proxyRes, req) => {
    console.log(
      `[HPM] ${proxyRes.statusCode} from USER_SERVICE for ${req.method} ${req.originalUrl}`
    );
  },
});

/**
 * ORDER PROXY
 */
const orderProxy = createProxyMiddleware({
  target: ORDER_SERVICE,
  changeOrigin: true,
  logLevel: 'debug',
  timeout: 30000,
  proxyTimeout: 30000,

  onError: (err, req, res) => {
    console.error('[HPM] Order service proxy error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Order service unavailable' });
    }
  },

  onProxyReq: (proxyReq, req) => {
    console.log(
      `[HPM] ${req.method} ${req.originalUrl} → ${ORDER_SERVICE}${proxyReq.path}`
    );
  },

  onProxyRes: (proxyRes, req) => {
    console.log(
      `[HPM] ${proxyRes.statusCode} from ORDER_SERVICE for ${req.method} ${req.originalUrl}`
    );
  },
});


// ✅ Proxy exact paths
app.use('/products', productProxy);
app.use('/categories', productProxy);
app.use('/search', productProxy);
app.use('/products/filter', productProxy);

// User routes
app.use('/api/users', userProxy);

// Order routes
app.use('/api/orders', orderProxy);

// Body parsing (Moved after proxies to avoid stream consumption)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Root
app.get('/', (_req, res) => {
  res.json({
    message: 'ShopEase API Gateway',
    endpoints: ['/products', '/categories', '/search', '/products/filter', '/api/users', '/api/orders'],
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Gateway running on http://0.0.0.0:${PORT}`);
});
