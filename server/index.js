require("dotenv").config();

const path = require("path");
const express = require("express");
const contactRouter = require("./routes/contact");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/contact", contactRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Fallback error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "サーバーエラーが発生しました。" });
});

app.listen(PORT, () => {
  console.log(`contact-form-sample server listening on http://localhost:${PORT}`);
});
