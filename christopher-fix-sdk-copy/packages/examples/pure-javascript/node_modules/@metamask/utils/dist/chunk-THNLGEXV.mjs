// src/time.ts
var Duration = /* @__PURE__ */ ((Duration2) => {
  Duration2[Duration2["Millisecond"] = 1] = "Millisecond";
  Duration2[Duration2["Second"] = 1e3] = "Second";
  Duration2[Duration2["Minute"] = 6e4] = "Minute";
  Duration2[Duration2["Hour"] = 36e5] = "Hour";
  Duration2[Duration2["Day"] = 864e5] = "Day";
  Duration2[Duration2["Week"] = 6048e5] = "Week";
  Duration2[Duration2["Year"] = 31536e6] = "Year";
  return Duration2;
})(Duration || {});
var isNonNegativeInteger = (number) => Number.isInteger(number) && number >= 0;
var assertIsNonNegativeInteger = (number, name) => {
  if (!isNonNegativeInteger(number)) {
    throw new Error(
      `"${name}" must be a non-negative integer. Received: "${number}".`
    );
  }
};
function inMilliseconds(count, duration) {
  assertIsNonNegativeInteger(count, "count");
  return count * duration;
}
function timeSince(timestamp) {
  assertIsNonNegativeInteger(timestamp, "timestamp");
  return Date.now() - timestamp;
}

export {
  Duration,
  inMilliseconds,
  timeSince
};
//# sourceMappingURL=chunk-THNLGEXV.mjs.map