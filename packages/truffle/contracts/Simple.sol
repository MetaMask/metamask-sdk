// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract Simple {
  string public text = "pong";

  // calldata uses less gas than memory
  function set(string calldata _text) external {
    text = _text;
  }

  function ping() external view returns (string memory) {
    return text;
  }
}
