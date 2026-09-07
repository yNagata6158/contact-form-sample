const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body) {
  const errors = {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name) errors.name = "お名前を入力してください。";
  else if (name.length > 100) errors.name = "お名前は100文字以内で入力してください。";

  if (!email) errors.email = "メールアドレスを入力してください。";
  else if (!EMAIL_RE.test(email)) errors.email = "メールアドレスの形式が正しくありません。";
  else if (email.length > 255) errors.email = "メールアドレスは255文字以内で入力してください。";

  if (!message) errors.message = "お問い合わせ内容を入力してください。";
  else if (message.length > 2000) errors.message = "お問い合わせ内容は2000文字以内で入力してください。";

  return { errors, values: { name, email, message } };
}

// POST /api/contact - store a new submission
router.post("/", async (req, res, next) => {
  try {
    const { errors, values } = validate(req.body ?? {});

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: "入力内容に誤りがあります。", fields: errors });
    }

    const result = await pool.query(
      `INSERT INTO contacts (name, email, message)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, message, created_at`,
      [values.name, values.email, values.message]
    );

    res.status(201).json({ contact: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/contact - list recent submissions (for verifying DB storage in this sample)
router.get("/", async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, message, created_at
       FROM contacts
       ORDER BY created_at DESC
       LIMIT 50`
    );
    res.json({ contacts: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
