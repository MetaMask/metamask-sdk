import { blockedDomainCheck } from './blockedDomainCheck';
import { documentElementCheck } from './documentElementCheck';
import { suffixCheck } from './suffixCheck';
import { doctypeCheck } from './doctypeCheck';

export const shouldInjectProvider = () => {
  if (
    typeof window === 'undefined' ||
    (typeof window !== 'undefined' &&
      typeof (window as any).ethereum === 'undefined')
  ) {
    return true;
  }

  const isProviderAlreadyInjected = window.ethereum !== undefined;
  const inject =
    !isProviderAlreadyInjected &&
    suffixCheck() &&
    doctypeCheck() &&
    documentElementCheck() &&
    !blockedDomainCheck();
  return inject;
};
