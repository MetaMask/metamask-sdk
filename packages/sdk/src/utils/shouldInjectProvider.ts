import { blockedDomainCheck } from './blockedDomainCheck';
import { doctypeCheck } from './doctypeCheck';
import { documentElementCheck } from './documentElementCheck';
import { suffixCheck } from './suffixCheck';

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
