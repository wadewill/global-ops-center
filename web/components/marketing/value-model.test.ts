import assert from "node:assert/strict";
import test from "node:test";
import { calculateValue, defaultValueInputs, valueFields } from "./value-model";

test("changing calculator language preserves the scenario's numerical result", () => {
  const chinese = calculateValue(defaultValueInputs, "zh-CN");
  const english = calculateValue(defaultValueInputs, "en");
  assert.deepEqual(english, chinese);
  assert.deepEqual(english.errors, {});
  assert.deepEqual(english.result, {
    beforeOrders: 300, afterOrders: 360, extraOrders: 60, percentagePoints: 0.3,
    extraRevenue: 12000, extraGrossProfit: 3600, afterBudget: 3301,
  });
});

test("missing and non-finite values have English field-specific validation messages", () => {
  for (const field of valueFields) {
    for (const invalid of ["", " ", "not-a-number", "Infinity"]) {
      const result = calculateValue({ ...defaultValueInputs, [field.key]: invalid }, "en");
      assert.equal(result.result, null);
      assert.deepEqual(Object.keys(result.errors), [field.key]);
      assert.match(result.errors[field.key]!, /^Enter a valid value for [a-z]/);
      assert.doesNotMatch(result.errors[field.key]!, /\p{Script=Han}/u);
    }
  }
  assert.equal(calculateValue({ ...defaultValueInputs, orderValue: "" }, "en").errors.orderValue,
    "Enter a valid value for average order value");
});

test("out-of-range values report readable English bounds", () => {
  for (const field of valueFields) {
    for (const invalid of [field.min - 1, field.max + 1]) {
      const output = calculateValue({ ...defaultValueInputs, [field.key]: String(invalid) }, "en");
      assert.equal(output.result, null);
      assert.match(output.errors[field.key]!, /^Enter a value from 0 to [\d,]+$/);
      assert.doesNotMatch(output.errors[field.key]!, /\p{Script=Han}/u);
    }
  }
  assert.equal(calculateValue({ ...defaultValueInputs, visits: "10000001" }, "en").errors.visits,
    "Enter a value from 0 to 10,000,000");
});

test("whole-visit and decimal-precision errors follow the requested language", () => {
  const inputs = { ...defaultValueInputs, visits: "20.5", targetRate: "1.801" };
  const english = calculateValue(inputs, "en");
  assert.equal(english.result, null);
  assert.equal(english.errors.visits, "Enter visits as a whole number");
  assert.equal(english.errors.targetRate, "Use at most 2 decimal places");
  const chinese = calculateValue(inputs);
  assert.equal(chinese.result, null);
  assert.match(chinese.errors.visits!, /整数/);
  assert.match(chinese.errors.targetRate!, /2 位小数/);
});
