const { test } = require("node:test");
const assert = require("node:assert/strict");
const { isHoneypotTriggered, HONEYPOT_FIELD } = require("../server/routes/contact");

test("honeypotフィールドが空ならトリガーされない", () => {
  assert.equal(isHoneypotTriggered({ [HONEYPOT_FIELD]: "" }), false);
});

test("honeypotフィールドが未指定でもトリガーされない", () => {
  assert.equal(isHoneypotTriggered({}), false);
});

test("honeypotフィールドが空白のみならトリガーされない", () => {
  assert.equal(isHoneypotTriggered({ [HONEYPOT_FIELD]: "   " }), false);
});

test("honeypotフィールドに値が入っているとトリガーされる", () => {
  assert.equal(isHoneypotTriggered({ [HONEYPOT_FIELD]: "https://spam.example.com" }), true);
});

test("honeypotフィールドが文字列以外の場合はトリガーされない (例外を投げない)", () => {
  assert.equal(isHoneypotTriggered({ [HONEYPOT_FIELD]: 123 }), false);
  assert.equal(isHoneypotTriggered({ [HONEYPOT_FIELD]: null }), false);
  assert.equal(isHoneypotTriggered(null), false);
  assert.equal(isHoneypotTriggered(undefined), false);
});
