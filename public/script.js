const form = document.getElementById("contact-form");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("form-status");

const rules = {
  name: (v) => (v.trim().length > 0 ? "" : "お名前を入力してください。"),
  email: (v) => {
    if (v.trim().length === 0) return "メールアドレスを入力してください。";
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    return ok ? "" : "メールアドレスの形式が正しくありません。";
  },
  category: (v) => (v.trim().length > 0 ? "" : "お問い合わせ種別を選択してください。"),
  message: (v) => (v.trim().length > 0 ? "" : "お問い合わせ内容を入力してください。"),
};

function showFieldError(field, message) {
  const el = form.querySelector(`[data-error-for="${field}"]`);
  if (el) el.textContent = message;
}

function validate(data) {
  let valid = true;
  for (const field of Object.keys(rules)) {
    const message = rules[field](data[field] ?? "");
    showFieldError(field, message);
    if (message) valid = false;
  }
  return valid;
}

function setStatus(type, message) {
  statusEl.className = type;
  statusEl.textContent = message;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("", "");

  const formData = new FormData(form);
  const data = {
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    category: formData.get("category")?.toString() ?? "",
    message: formData.get("message")?.toString() ?? "",
  };

  if (!validate(data)) {
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "送信中...";

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(body.error || "送信に失敗しました。");
    }

    // 送信成功時はサンクスページへ遷移する
    window.location.href = "thanks.html";
    return;
  } catch (err) {
    setStatus("error", err.message || "送信中にエラーが発生しました。時間をおいて再度お試しください。");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "送信する";
  }
});
