import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || 'http://localhost:8000';

/**
 * PRODUCT PROXY
 * NOTE: no pathRewrite here
 */
const productProxy = createProxyMiddleware({
  target: PRODUCT_SERVICE,
  changeOrigin: true,
  logLevel: 'debug', // runtime logging only, TS-safe
});

// ✅ Proxy exact paths
app.use('/products', productProxy);
app.use('/categories', productProxy);
app.use('/search', productProxy);
app.use('/products/filter', productProxy);

// Health
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Root
app.get('/', (_req, res) => {
  res.json({
    message: 'ShopEase API Gateway',
    endpoints: ['/products', '/categories', '/search', '/products/filter'],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Gateway running on http://localhost:${PORT}`);
});
