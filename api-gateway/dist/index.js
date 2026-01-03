"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const app = (0, express_1.default)();
const PORT = 5000;
app.use((0, cors_1.default)({
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
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Use Docker service names when running in containers, localhost for local dev
const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL ||
    (process.env.NODE_ENV === 'production' ? 'http://product_service:8000' : 'http://localhost:8000');
const USER_SERVICE = process.env.USER_SERVICE_URL ||
    (process.env.NODE_ENV === 'production' ? 'http://user_service:4000' : 'http://localhost:4000');
/**
 * PRODUCT PROXY
 * NOTE: no pathRewrite here
 */
const productProxy = (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: PRODUCT_SERVICE,
    changeOrigin: true,
    logLevel: 'debug', // runtime logging only, TS-safe
});
/**
 * USER PROXY
 */
const userProxy = (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: USER_SERVICE,
    changeOrigin: true,
    logLevel: 'debug',
    timeout: 30000, // 30 seconds timeout
    proxyTimeout: 30000,
    onError: (err, req, res) => {
        console.error('[HPM] Proxy error:', err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Service unavailable', details: err.message });
        }
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[HPM] Proxying ${req.method} ${req.url} to ${USER_SERVICE}${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[HPM] Response ${proxyRes.statusCode} from ${USER_SERVICE} for ${req.method} ${req.url}`);
    },
    onProxyReqWs: (proxyReq, req, socket) => {
        console.log('[HPM] WebSocket proxy request');
    },
});
// ✅ Proxy exact paths
app.use('/products', productProxy);
app.use('/categories', productProxy);
app.use('/search', productProxy);
app.use('/products/filter', productProxy);
// User routes
app.use('/api/users', userProxy);
// Health
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
});
// Root
app.get('/', (_req, res) => {
    res.json({
        message: 'ShopEase API Gateway',
        endpoints: ['/products', '/categories', '/search', '/products/filter', '/api/users'],
    });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Gateway running on http://0.0.0.0:${PORT}`);
});
