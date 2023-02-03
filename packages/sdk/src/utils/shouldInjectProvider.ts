import { blockedDomainCheck } from './blockedDomainCheck';
import { doctypeCheck } from './doctypeCheck';
import { documentElementCheck } from './documentElementCheck';
import { suffixCheck } from './suffixCheck';

export const shouldInjectProvider = () => {
  const isProviderAlreadyInjected =
    typeof window !== 'undefined' && window?.ethereum !== undefined;
  return (
    !isProviderAlreadyInjected &&
    doctypeCheck() &&
    suffixCheck() &&
    documentElementCheck() &&
    !blockedDomainCheck()
  );
};
