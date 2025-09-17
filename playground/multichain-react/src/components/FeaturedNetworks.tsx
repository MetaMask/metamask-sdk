/* eslint-disable */
import type { Scope } from '@metamask/multichain-sdk';
// biome-ignore lint/style/useImportType: <explanation>
import React from 'react';

import { FEATURED_NETWORKS } from '../constants/networks';
import { escapeHtmlId } from '../helpers/IdHelpers';

type FeaturedNetworksProps = {
	selectedScopes: Record<string, boolean>;
	setSelectedScopes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
	isExternallyConnectableConnected: boolean;
};

export const FeaturedNetworks: React.FC<FeaturedNetworksProps> = ({ selectedScopes, setSelectedScopes, isExternallyConnectableConnected }) => {
	const featuredNetworks = Object.entries(FEATURED_NETWORKS);
	return (
		<div className="space-y-2">
			{featuredNetworks.map(([networkName, chainId]) => (
				<label key={chainId} className="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						name={chainId}
						checked={selectedScopes[chainId as Scope] ?? false}
						onChange={(evt) =>
							setSelectedScopes((prev) => ({
								...prev,
								[chainId]: evt.target.checked,
							}))
						}
						disabled={!isExternallyConnectableConnected}
						data-testid={`network-checkbox-${escapeHtmlId(chainId)}`}
						id={`network-checkbox-${escapeHtmlId(chainId)}`}
						className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
					/>
					<span className="text-gray-700">{networkName}</span>
				</label>
			))}
		</div>
	);
};
