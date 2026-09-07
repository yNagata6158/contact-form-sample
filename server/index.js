require("dotenv").config();

const path = require("path");
const express = require("express");
const contactRouter = require("./routes/contact");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// リクエストログ (メソッド・パス・ステータス・所要時間)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
  });
  next();
});

app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/contact", contactRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Fallback error handler
app.use((err, req, res, _next) => {
  console.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);
  res.status(500).json({ error: "サーバーエラーが発生しました。" });
});

// プロセスレベルの未処理エラーはログを残してから終了する
// (コンテナオーケストレーターが再起動する前提)
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`contact-form-sample server listening on http://localhost:${PORT}`);
});
