import { EventType, PROVIDER_UPDATE_TYPE } from "@metamask/sdk";
import { handleProviderEvent } from "./handleProviderEvent";

describe("handleProviderEvent", () => {
  let setConnecting: jest.Mock;
  let setTrigger: jest.Mock;

  beforeEach(() => {
    setConnecting = jest.fn();
    setTrigger = jest.fn();

    console.debug = jest.fn();
  });

  it("should handle provider event correctly with debug enabled and TERMINATE type", () => {
    const debug = true;
    const type = PROVIDER_UPDATE_TYPE.TERMINATE;

    const callback = handleProviderEvent(debug, setConnecting, setTrigger);
    callback(type);

    expect(console.debug).toHaveBeenCalledWith(
      `MetaMaskProvider::sdk on '${EventType.PROVIDER_UPDATE}' event.`,
      type,
    );
    expect(setConnecting).toHaveBeenCalledWith(false);
    expect(setTrigger).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should handle provider event with other type than TERMINATE", () => {
    const debug = true;
    const type = PROVIDER_UPDATE_TYPE.EXTENSION;

    const callback = handleProviderEvent(debug, setConnecting, setTrigger);
    callback(type);

    expect(setConnecting).not.toHaveBeenCalled();
    expect(setTrigger).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should handle provider event without debug logs", () => {
    const debug = false;
    const type = PROVIDER_UPDATE_TYPE.TERMINATE;

    const callback = handleProviderEvent(debug, setConnecting, setTrigger);
    callback(type);

    expect(console.debug).not.toHaveBeenCalled();
    expect(setConnecting).toHaveBeenCalledWith(false);
    expect(setTrigger).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should increment the trigger value", () => {
    const type = PROVIDER_UPDATE_TYPE.TERMINATE;
    setTrigger.mockImplementation((fn: (prev: number) => number) => {
      const newValue = fn(2);
      expect(newValue).toBe(3);
    });

    const callback = handleProviderEvent(true, setConnecting, setTrigger);
    callback(type);
  });
});

