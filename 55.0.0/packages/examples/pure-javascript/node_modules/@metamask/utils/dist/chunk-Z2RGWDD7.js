"use strict";Object.defineProperty(exports, "__esModule", {value: true});



var _chunk3W5G4CYIjs = require('./chunk-3W5G4CYI.js');

// src/collections.ts
var _map;
var FrozenMap = class {
  constructor(entries) {
    _chunk3W5G4CYIjs.__privateAdd.call(void 0, this, _map, void 0);
    _chunk3W5G4CYIjs.__privateSet.call(void 0, this, _map, new Map(entries));
    Object.freeze(this);
  }
  get size() {
    return _chunk3W5G4CYIjs.__privateGet.call(void 0, this, _map).size;
  }
  [Symbol.iterator]() {
    return _chunk3W5G4CYIjs.__privateGet.call(void 0, this, _map)[Symbol.iterator]();
  }
  entries() {
    return _chunk3W5G4CYIjs.__privateGet.call(void 0, this, _map).entries();
  }
  forEach(callbackfn, thisArg) {
    return _chunk3W5G4CYIjs.__privateGet.call(void 0, this, _map).forEach(
      (value, key, _map2) => callbackfn.call(thisArg, value, key, this)
    );
  }
  get(key) {
    return _chunk3W5G4CYIjs.__privateGet.call(void 0, this, _map).get(key);
  }
  has(key) {
    return _chunk3W5G4CYIjs.__privateGet.call(void 0, this, _map).has(key);
  }
  keys() {
    return _chunk3W5G4CYIjs.__privateGet.call(void 0, this, _map).keys();
  }
  values() {
    return _chunk3W5G4CYIjs.__privateGet.call(void 0, this, _map).values();
  }
  toString() {
    return `FrozenMap(${this.size}) {${this.size > 0 ? ` ${[...this.entries()].map(([key, value]) => `${String(key)} => ${String(value)}`).join(", ")} ` : ""}}`;
  }
};
_map = new WeakMap();
var _set;
var FrozenSet = class {
  constructor(values) {
    _chunk3W5G4CYIjs.__privateAdd.call(void 0, this, _set, void 0);
    _chunk3W5G4CYIjs.__privateSet.call(void 0, this, _set, new Set(values));
    Object.freeze(this);
  }
  get size() {
    return _chunk3W5G4CYIjs.__privateGet.call(void 0, this, _set).size;
  }
  [Symbol.iterator]() {
    return _chunk3W5G4CYIjs.__privateGet.call(void 0, this, _set)[Symbol.iterator]();
  }
  entries() {
    return _chunk3W5G4CYIjs.__privateGet.call(void 0, this, _set).entries();
  }
  forEach(callbackfn, thisArg) {
    return _chunk3W5G4CYIjs.__privateGet.call(void 0, this, _set).forEach(
      (value, value2, _set2) => callbackfn.call(thisArg, value, value2, this)
    );
  }
  has(value) {
    return _chunk3W5G4CYIjs.__privateGet.call(void 0, this, _set).has(value);
  }
  keys() {
    return _chunk3W5G4CYIjs.__privateGet.call(void 0, this, _set).keys();
  }
  values() {
    return _chunk3W5G4CYIjs.__privateGet.call(void 0, this, _set).values();
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




exports.FrozenMap = FrozenMap; exports.FrozenSet = FrozenSet;
//# sourceMappingURL=chunk-Z2RGWDD7.js.map