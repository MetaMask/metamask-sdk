import React from 'react';
import useBalance from '../hooks/useBalance';

const Balance = ({ theme }: { theme: string }) => {
  const { balance, formattedBalance, isLoading, isError } = useBalance();

  if (!balance || isLoading || isError) return null;

  return (
    <div
      className="tw-pl-4 tw-grid tw-content-center tw-justify-center tw-text-center"
      style={{ fontSize: 13 }}
    >
      <span
        className={`${
          theme === 'light' ? 'tw-bg-neutral-200' : 'tw-bg-neutral-400'
        } tw-p-1.5 tw-rounded`}
      >
        {formattedBalance}
      </span>
    </div>
  );
};

export default Balance;
