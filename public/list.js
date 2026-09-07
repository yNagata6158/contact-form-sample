const statusEl = document.getElementById("list-status");
const table = document.getElementById("list-table");
const tbody = document.getElementById("list-body");
const emptyEl = document.getElementById("list-empty");

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function load() {
  statusEl.textContent = "読み込み中...";
  statusEl.className = "";

  try {
    const res = await fetch("/api/contact");
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(body.error || "一覧の取得に失敗しました。");
    }

    const contacts = Array.isArray(body.contacts) ? body.contacts : [];
    const categories = body.categories || {};

    statusEl.textContent = "";

    if (contacts.length === 0) {
      emptyEl.hidden = false;
      table.hidden = true;
      return;
    }

    tbody.innerHTML = contacts
      .map((c) => {
        const categoryLabel = categories[c.category] || c.category || "";
        return `<tr>
          <td>${escapeHtml(formatDate(c.created_at))}</td>
          <td>${escapeHtml(c.name)}</td>
          <td>${escapeHtml(c.email)}</td>
          <td>${escapeHtml(categoryLabel)}</td>
          <td class="message-cell">${escapeHtml(c.message)}</td>
        </tr>`;
      })
      .join("");

    table.hidden = false;
    emptyEl.hidden = true;
  } catch (err) {
    statusEl.className = "error";
    statusEl.textContent = err.message || "一覧の取得中にエラーが発生しました。";
  }
}

load();
