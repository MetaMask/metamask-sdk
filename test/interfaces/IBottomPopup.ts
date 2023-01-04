import { MetamaskElement } from '../utils';

export type IBottomPopup = {
  cancelButton: MetamaskElement;
  approveButton: MetamaskElement;

  tapApproveButton(): Promise<void>;
  tapCancelButton(): Promise<void>;

  getRApproveButtonText(): Promise<string>;
  getCancelButtonText(): Promise<string>;
};
