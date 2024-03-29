import { useMemo } from 'react';
import { useTheme } from '../../theme';
import { Theme } from '../../theme/models';

/**
 * Hook that handles both passing style sheet variables into style sheet and memoization.
 *
 * @param styleSheet Return value of useStyles hook.
 * @param vars Variables of styleSheet function.
 * @returns StyleSheet object.
 */
export const useStyles = <R, V>(
  styleSheet: (params: { theme: Theme; vars: V }) => R,
  vars: V,
): { styles: R; theme: Theme } => {
  const theme = useTheme();
  const styles = useMemo(
    () => styleSheet({ theme, vars }),
    [styleSheet, theme, vars],
  );
  return { styles, theme };
};
