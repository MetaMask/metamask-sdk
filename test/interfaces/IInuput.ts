export type IInputBase = {
  setValue(value: any): Promise<void>;
  clear(): Promise<void>;
  getValue(): Promise<any>;
  waitForInputEnabled(): Promise<void>;
  isDisplayed(): Promise<boolean>;
};

export type IInput<T> = {
  setValue(value: T): Promise<void>;
  getValue(): Promise<T>;
} & IInputBase;
