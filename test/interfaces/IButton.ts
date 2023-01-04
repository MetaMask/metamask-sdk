export type IButtonBase = {
  getText(): Promise<any>;
  waitForClickable(): Promise<void>;
  isDisplayed(): Promise<boolean>;
  isClickable(): Promise<boolean>;
};

export type IButton<T> = {
  getText(): Promise<T>;
} & IButtonBase;
