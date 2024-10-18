import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "./chunk-X66SUIEF.mjs";

// src/collections.ts
var _map;
var FrozenMap = class {
  constructor(entries) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, new Map(entries));
    Object.freeze(this);
  }
  get size() {
    return __privateGet(this, _map).size;
  }
  [Symbol.iterator]() {
    return __privateGet(this, _map)[Symbol.iterator]();
  }
  entries() {
    return __privateGet(this, _map).entries();
  }
  forEach(callbackfn, thisArg) {
    return __privateGet(this, _map).forEach(
      (value, key, _map2) => callbackfn.call(thisArg, value, key, this)
    );
  }
  get(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  keys() {
    return __privateGet(this, _map).keys();
  }
  values() {
    return __privateGet(this, _map).values();
  }
  toString() {
    return `FrozenMap(${this.size}) {${this.size > 0 ? ` ${[...this.entries()].map(([key, value]) => `${String(key)} => ${String(value)}`).join(", ")} ` : ""}}`;
  }
};
_map = new WeakMap();
var _set;
var FrozenSet = class {
  constructor(values) {
    __privateAdd(this, _set, void 0);
    __privateSet(this, _set, new Set(values));
    Object.freeze(this);
  }
  get size() {
    return __privateGet(this, _set).size;
  }
  [Symbol.iterator]() {
    return __privateGet(this, _set)[Symbol.iterator]();
  }
  entries() {
    return __privateGet(this, _set).entries();
  }
  forEach(callbackfn, thisArg) {
    return __privateGet(this, _set).forEach(
      (value, value2, _set2) => callbackfn.call(thisArg, value, value2, this)
    );
  }
  has(value) {
    return __privateGet(this, _set).has(value);
  }
  keys() {
    return __privateGet(this, _set).keys();
  }
  values() {
    return __privateGet(this, _set).values();
  }
  toString() {
    return `FrozenSet(${this.size}) {${this.size > 0 ? ` ${[...this.values()].map((member) => String(member)).join(", ")} ` : ""}}`;
  }
};
_set = new WeakMap();
Object.freeze(FrozenMap);
Object.freeze(FrozenMap.prototype);
Object.freeze(FrozenSet);
Object.freeze(FrozenSet.prototype);

export {
  FrozenMap,
  FrozenSet
};
//# sourceMappingURL=chunk-JPAL7Q5S.mjs.map