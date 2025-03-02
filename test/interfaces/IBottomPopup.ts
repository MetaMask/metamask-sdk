import { MetamaskElement } from '../utils/Selectors';

export type IBottomPopup = {
  cancelButton: MetamaskElement;
  approveButton: MetamaskElement;

  tapApproveButton(): Promise<void>;
  tapCancelButton(): Promise<void>;

  getApproveButtonText(): Promise<string>;
  getCancelButtonText(): Promise<string>;
};
