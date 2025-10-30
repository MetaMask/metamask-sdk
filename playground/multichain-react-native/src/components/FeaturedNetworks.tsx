/* eslint-disable */
import type { Scope } from '@metamask/multichain-sdk';
import type React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { FEATURED_NETWORKS } from '../constants/networks';
import { colors } from '../styles/shared';

type FeaturedNetworksProps = {
	selectedScopes: Record<string, boolean>;
	setSelectedScopes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
	isExternallyConnectableConnected: boolean;
};

export const FeaturedNetworks: React.FC<FeaturedNetworksProps> = ({ selectedScopes, setSelectedScopes, isExternallyConnectableConnected }) => {
	const featuredNetworks = Object.entries(FEATURED_NETWORKS);
	return (
		<View style={styles.container}>
			{featuredNetworks.map(([networkName, chainId]) => {
				const isChecked = selectedScopes[chainId as Scope] ?? false;
				const isDisabled = !isExternallyConnectableConnected;

				return (
					<TouchableOpacity
						key={chainId}
						style={[styles.networkItem, isChecked && styles.networkItemChecked, isDisabled && styles.networkItemDisabled]}
						onPress={() => {
							if (!isDisabled) {
								setSelectedScopes((prev) => ({
									...prev,
									[chainId]: !isChecked,
								}));
							}
						}}
						disabled={isDisabled}
						activeOpacity={0.7}
					>
						<View style={[styles.checkbox, isChecked && styles.checkboxChecked, isDisabled && styles.checkboxDisabled]}>
							{isChecked && <View style={styles.checkboxInner} />}
						</View>
						<Text style={[styles.networkLabel, isDisabled && styles.networkLabelDisabled]}>{networkName}</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginVertical: 8,
	},
	networkItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 12,
		marginBottom: 6,
		borderRadius: 6,
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.gray200,
	},
	networkItemChecked: {
		backgroundColor: colors.blue500,
		borderColor: colors.blue500,
	},
	networkItemDisabled: {
		opacity: 0.5,
	},
	checkbox: {
		width: 20,
		height: 20,
		borderRadius: 4,
		borderWidth: 2,
		borderColor: colors.gray300,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.white,
	},
	checkboxChecked: {
		borderColor: colors.blue600,
		backgroundColor: colors.blue600,
	},
	checkboxDisabled: {
		borderColor: colors.gray300,
		backgroundColor: colors.gray100,
	},
	checkboxInner: {
		width: 10,
		height: 10,
		borderRadius: 2,
		backgroundColor: colors.white,
	},
	networkLabel: {
		marginLeft: 12,
		fontSize: 14,
		color: colors.gray700,
	},
	networkLabelDisabled: {
		color: colors.gray400,
	},
});

