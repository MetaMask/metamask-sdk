/* eslint-disable */

import type React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, sharedStyles } from '../styles/shared';

export enum INPUT_LABEL_TYPE {
	ADDRESS = 'Address',
	SCOPE = 'Scope',
	CAIP_ACCOUNT_ID = 'CAIP Address',
}

type DynamicInputsProps = {
	inputArray: string[];
	availableOptions: { name: string; value: string }[];
	handleCheckboxChange: (value: string, isChecked: boolean) => void;
	label: INPUT_LABEL_TYPE;
};

const DynamicInputs: React.FC<DynamicInputsProps> = ({ inputArray, handleCheckboxChange, label, availableOptions }) => {
	return (
		<View style={styles.container}>
			<Text style={sharedStyles.heading3}>{label}s:</Text>
			<View style={sharedStyles.rowWrap}>
				{availableOptions.map((option) => {
					const isChecked = inputArray.includes(option.value);
					return (
						<TouchableOpacity
							key={`checkbox-${option.value}`}
							style={[styles.checkboxItem, isChecked && styles.checkboxItemChecked]}
							onPress={() => handleCheckboxChange(option.value, !isChecked)}
							activeOpacity={0.7}
						>
							<View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
								{isChecked && <View style={styles.checkboxInner} />}
							</View>
							<Text style={styles.checkboxLabel}>{option.name}</Text>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
	},
	checkboxItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 6,
		marginRight: 8,
		marginBottom: 8,
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.gray200,
	},
	checkboxItemChecked: {
		backgroundColor: colors.blue50,
		borderColor: colors.blue500,
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
	checkboxInner: {
		width: 10,
		height: 10,
		borderRadius: 2,
		backgroundColor: colors.white,
	},
	checkboxLabel: {
		marginLeft: 8,
		fontSize: 14,
		color: colors.gray700,
	},
});

export default DynamicInputs;

