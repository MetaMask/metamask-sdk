import React, { useEffect, useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import {
  useAccount,
  useConnect,
  useNetwork,
} from '../hooks/MetaMaskWagmiHooks';
import { useSDK } from '@metamask/sdk-react';
import '../style.css';
import Balance from './Balance';
import IconNetwork from './IconNetwork';
import IconOriginal from './IconOriginal';
import IconSimplified from './IconSimplified';
import IconWrongNetwork from './IconWrongNetwork';
import MetaMaskModal from './MetaMaskModal';
import { truncatedAddress } from './utils';
import { TFunction } from 'i18next';

export interface Account {
  address: string;
  balance?: string;
}

interface Props {
  color?: 'blue' | 'white' | 'orange';
  theme?: 'dark' | 'light';
  shape?: 'rectangle' | 'rounded' | 'rounded-full';
  icon?: 'original' | 'simplified' | 'no-icon';
  iconPosition?: 'left' | 'right';
  text?: 'Connect wallet' | 'MetaMask' | 'Connect with MetaMask' | string;
  textAlign?: 'middle' | 'left';
  buttonStyle?: any;
  textStyle?: any;
  iconStyle?: any;
  removeDefaultStyles?: boolean;
  connectComponent?: React.ReactNode;
  wrongNetworkComponent?: React.ReactNode;
  wrongNetworkText?: 'Wrong network' | 'Switch network' | string;
  connectedComponent?: React.ReactNode;
  connectedType?:
    | 'custom-text'
    | 'network-account-balance'
    | 'network-account'
    | 'account-balance'
    | 'separate-network-account';
  connectedText?: 'Connected';
}

const MetaMaskButton = ({
  color,
  theme = 'dark',
  shape,
  icon,
  iconPosition,
  text = 'Connect wallet',
  textAlign,
  buttonStyle,
  textStyle,
  iconStyle,
  removeDefaultStyles,
  connectComponent,
  wrongNetworkComponent,
  wrongNetworkText = 'Switch network',
  connectedComponent,
}: // connectedType = 'network-account-balance', // keep for reference and future implementation
Props) => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { sdk, connected } = useSDK();
  const { connect } = useConnect();

  const t = sdk?.i18nInstance?.t as TFunction;

  const [modalOpen, setModalOpen] = useState(false);
  const wrongNetwork = isConnected && (!chain || chain.unsupported);

  useEffect(() => {
    const synConnected = () => {
      if (!isConnected) {
        connect();
      }
    };

    if (connected && !isConnected) {
      // force synchronize state between sdk and wagmi
      synConnected();
    } else if (!connected) {
      sdk?.getProvider()?.once('_initialized', synConnected);
    }

    return () => {
      sdk?.getProvider()?.removeListener('_initialized', synConnected);
    };
  }, [sdk, connected, isConnected, connect]);

  const getColors = () => {
    if (wrongNetwork) return 'from-red-500 to-red-500';

    if (isConnected && theme === 'light') {
      return 'from-white to-white';
    } else if (isConnected) {
      return 'from-neutral-500 to-neutral-500';
    }

    if (color === 'blue') return 'from-blue-500 to-blue-500';
    else if (color === 'white') return 'from-white to-white';

    return 'from-orange-500 to-orange-500';
  };

  const getTextColor = () => {
    if (color === 'white') return 'text-black';

    return 'text-white';
  };

  const getShape = () => {
    if (shape === 'rectangle') {
      return '';
    } else if (shape === 'rounded-full') {
      return 'rounded-full';
    }

    return 'rounded-lg';
  };

  const getIcon = () => {
    if (icon === 'no-icon') {
      return null;
    } else if (icon === 'original') {
      return <IconOriginal style={iconStyle} />;
    }

    return (
      <IconSimplified
        style={iconStyle}
        color={color === 'white' ? 'orange' : 'white'}
      />
    );
  };

  const getIconMargin = () => {
    if (icon === 'no-icon') return '';
    else if (iconPosition === 'right') return 'pr-3';

    return 'pl-3';
  };

  const getText = () => {
    if (wrongNetwork) {
      if (wrongNetworkComponent) return wrongNetworkComponent;
      return (
        <div
          className={`relative flex content-center ${
            textAlign !== 'left' ? 'justify-center' : ''
          } ${getTextColor()}`}
        >
          <IconWrongNetwork style={iconStyle} />{' '}
          <span style={textStyle} className={'pl-2'}>
            {wrongNetworkText}
          </span>
        </div>
      );
    }

    if (isConnected) {
      if (connectedComponent) return connectedComponent;
      return (
        <div
          className={`flex relative content-center ${
            textAlign !== 'left' ? 'justify-center' : ''
          } ${getTextColor()}`}
        >
          <div style={{ width: 30, height: 30 }} className="mt-1 relative">
            <div
              style={{
                fontSize: 8,
                marginTop: -3,
                marginRight: -3,
              }}
              className="flex content-center justify-center absolute right-0"
            >
              <IconNetwork network={chain} />
            </div>
            <Jazzicon
              diameter={30}
              seed={jsNumberForAddress(address || '0x0')}
            />
          </div>
          <div
            style={{ fontSize: 13, lineHeight: '18px' }}
            className="pl-4 text-left flex flex-col"
          >
            {chain && (
              <span
                style={{ ...textStyle, height: 19.5 }}
                className={'text-left'}
              >
                <b>{chain?.name || chain?.network}</b>
              </span>
            )}
            <span
              style={{ ...textStyle, fontSize: 11, height: 16.5 }}
              className={'text-left'}
            >
              {truncatedAddress(address)}
            </span>
          </div>
          {isConnected && <Balance theme={theme} />}
          <div className="pl-2 grid content-center justify-center text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
              />
            </svg>
          </div>
        </div>
      );
    }

    if (connectComponent) return connectedComponent;
    return (
      <div
        className={`relative flex ${
          textAlign !== 'left' ? 'justify-center' : ''
        } ${getTextColor()}`}
      >
        {iconPosition !== 'right' && getIcon()}{' '}
        {text && (
          <span style={textStyle} className={getIconMargin()}>
            {text}
          </span>
        )}
        {iconPosition === 'right' && getIcon()}
      </div>
    );
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const connectedAndRightNetwork = isConnected && !wrongNetwork;

  return (
    <>
      <button
        style={buttonStyle}
        className={`${connectedAndRightNetwork ? 'px-3' : 'px-6'} ${
          connectedAndRightNetwork ? 'py-1' : 'py-2.5'
        } relative ${getShape()} group font-medium text-white font-medium inline-block text-base`}
        onClick={
          isConnected
            ? openModal
            : () => {
                connect(); // TODO manage multichain.
              }
        }
      >
        {!removeDefaultStyles && (
          <>
            <span
              className={`absolute top-0 left-0 w-full h-full ${getShape()} opacity-50 filter blur-sm bg-gradient-to-br ${getColors()}`}
            ></span>
            <span
              className={`absolute inset-0 w-full h-full transition-all duration-200 ease-out ${getShape()} shadow-xl bg-gradient-to-br filter group-active:opacity-0 group-hover:blur-sm ${getColors()}`}
            ></span>
            <span
              className={`absolute inset-0 w-full h-full transition duration-200 ease-out ${getShape()} bg-gradient-to-br ${getColors()}`}
            ></span>
          </>
        )}
        {getText()}
      </button>
      {<MetaMaskModal t={t} isOpen={modalOpen} setIsOpen={setModalOpen} />}
    </>
  );
};

export default MetaMaskButton;
