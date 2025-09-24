/* eslint-disable */

import type React from 'react';

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
		<div className="space-y-3">
			<h3 className="text-lg font-medium text-gray-800">{label}s:</h3>
			<div className="flex flex-wrap gap-4">
				{availableOptions.map((option) => {
					const isChecked = inputArray.includes(option.value);
					return (
						<label key={`checkbox-${option.value}`} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
							<input
								type="checkbox"
								checked={isChecked}
								onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
								className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
							/>
							<span className="text-gray-700 select-none">{option.name}</span>
						</label>
					);
				})}
			</div>
		</div>
	);
};

export default DynamicInputs;
