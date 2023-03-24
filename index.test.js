const assert = require("assert");
const { test } = require("node:test");
const { addRoutesFolder } = require(".");

test("addRoutesFolder", (t) => {
  assert.throws(
    () => addRoutesFolder("admin-routes"),
    `Directory "admin-routes" does not exist.`
  );
});
