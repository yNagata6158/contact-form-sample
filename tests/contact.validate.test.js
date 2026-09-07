const { test } = require("node:test");
const assert = require("node:assert/strict");
const { validate, CATEGORIES } = require("../server/routes/contact");

const validBody = {
  name: "テスト太郎",
  email: "test@example.com",
  category: "general",
  message: "お問い合わせ内容のサンプルです。",
};

test("有効な入力ではエラーが発生しない", () => {
  const { errors, values } = validate(validBody);
  assert.deepEqual(errors, {});
  assert.equal(values.name, "テスト太郎");
  assert.equal(values.category, "general");
});

test("必須項目が空の場合はそれぞれエラーになる", () => {
  const { errors } = validate({ name: "", email: "", category: "", message: "" });
  assert.equal(errors.name, "お名前を入力してください。");
  assert.equal(errors.email, "メールアドレスを入力してください。");
  assert.equal(errors.category, "お問い合わせ種別を選択してください。");
  assert.equal(errors.message, "お問い合わせ内容を入力してください。");
});

test("メールアドレスの形式が不正な場合はエラーになる", () => {
  const { errors } = validate({ ...validBody, email: "not-an-email" });
  assert.equal(errors.email, "メールアドレスの形式が正しくありません。");
});

test("categoryがCATEGORIESに存在しない値の場合はエラーになる", () => {
  const { errors } = validate({ ...validBody, category: "bogus" });
  assert.equal(errors.category, "お問い合わせ種別の指定が正しくありません。");
});

test("CATEGORIESに定義された値はすべて正常に通る", () => {
  for (const key of Object.keys(CATEGORIES)) {
    const { errors } = validate({ ...validBody, category: key });
    assert.equal(errors.category, undefined, `category "${key}" should be valid`);
  }
});

test("文字数上限を超えるとエラーになる", () => {
  const { errors: nameErrors } = validate({ ...validBody, name: "あ".repeat(101) });
  assert.equal(nameErrors.name, "お名前は100文字以内で入力してください。");

  const { errors: emailErrors } = validate({
    ...validBody,
    email: `${"a".repeat(250)}@example.com`,
  });
  assert.equal(emailErrors.email, "メールアドレスは255文字以内で入力してください。");

  const { errors: messageErrors } = validate({ ...validBody, message: "あ".repeat(2001) });
  assert.equal(messageErrors.message, "お問い合わせ内容は2000文字以内で入力してください。");
});

test("前後の空白はトリムされる", () => {
  const { values } = validate({ ...validBody, name: "  テスト太郎  " });
  assert.equal(values.name, "テスト太郎");
});

test("文字列以外の値はバリデーションエラーとして扱われる (例外を投げない)", () => {
  const { errors } = validate({ name: 123, email: null, category: undefined, message: {} });
  assert.equal(errors.name, "お名前を入力してください。");
  assert.equal(errors.email, "メールアドレスを入力してください。");
  assert.equal(errors.category, "お問い合わせ種別を選択してください。");
  assert.equal(errors.message, "お問い合わせ内容を入力してください。");
});
