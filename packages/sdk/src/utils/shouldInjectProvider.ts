import { blockedDomainCheck } from './blockedDomainCheck';
import { documentElementCheck } from './documentElementCheck';
import { suffixCheck } from './suffixCheck';

export const shouldInjectProvider = () => {
  const isProviderAlreadyInjected =
    typeof window !== 'undefined' && window?.ethereum !== undefined;
  const inject =
    !isProviderAlreadyInjected &&
    suffixCheck() &&
    documentElementCheck() &&
    !blockedDomainCheck();
  return inject;
};
