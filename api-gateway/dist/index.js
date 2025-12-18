"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
// ---------------------------
// GLOBAL MIDDLEWARE
// ---------------------------
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
// ---------------------------
// HEALTH CHECK
// ---------------------------
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "OK",
        service: "api-gateway",
        timestamp: new Date().toISOString(),
    });
});
// ---------------------------
// SERVICE CONFIG
// ---------------------------
const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || "http://product_service:8000";
// ---------------------------
// PROXY CONFIG
// ---------------------------
const productProxy = (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: PRODUCT_SERVICE,
    changeOrigin: true,
    proxyTimeout: 10000,
    timeout: 10000,
    pathRewrite: {
        "^/products$": "/products/",
        "^/categories$": "/categories/",
        "^/search$": "/search/",
        "^/products/filter$": "/products/filter/",
    },
    on: {
        proxyReq(proxyReq, req, _res) {
            console.log(`➡️  [Gateway → Product] ${req.method} ${req.url}`);
        },
        proxyRes(proxyRes, req, _res) {
            console.log(`⬅️  [Product → Gateway] ${req.method} ${req.url} → ${proxyRes.statusCode}`);
        },
        error(err, _req, res) {
            console.error("❌ Product Service Proxy Error:", err.message);
            if (res instanceof http_1.ServerResponse && !res.headersSent) {
                res.writeHead(502, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    error: "Bad Gateway",
                    service: "product_service",
                    detail: err.message,
                }));
            }
        },
    },
}); // cast as any to avoid TypeScript errors
// ---------------------------
// PROXY ROUTES
// ---------------------------
app.use("/products", productProxy);
app.use("/categories", productProxy);
app.use("/search", productProxy);
app.use("/products/filter", productProxy);
// ---------------------------
// ROOT ENDPOINT
// ---------------------------
app.get("/", (_req, res) => {
    res.json({
        message: "ShopEase API Gateway",
        version: "1.0.0",
        services: {
            product_service: PRODUCT_SERVICE,
        },
        endpoints: ["/products", "/categories", "/search", "/products/filter"],
    });
});
// ---------------------------
// 404 HANDLER
// ---------------------------
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.originalUrl,
    });
});
// ---------------------------
// START SERVER
// ---------------------------
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🛍 API Gateway running on port ${PORT}`);
    console.log(`📦 Product service → ${PRODUCT_SERVICE}`);
});
