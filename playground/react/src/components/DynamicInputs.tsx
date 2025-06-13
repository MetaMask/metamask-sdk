/* eslint-disable */

import type React from 'react';
import { useCallback, useState } from 'react';

export enum INPUT_LABEL_TYPE {
  ADDRESS = 'Address',
  SCOPE = 'Scope',
  CAIP_ACCOUNT_ID = 'CAIP Address',
}

const LABEL_PLACEHOLDER = {
  [INPUT_LABEL_TYPE.ADDRESS]: '0x483b...5f97',
  [INPUT_LABEL_TYPE.SCOPE]: 'eip155:1',
  [INPUT_LABEL_TYPE.CAIP_ACCOUNT_ID]: 'eip155:1:0x483b...5f97',
};

type DynamicInputsProps = {
  inputArray: string[];
  setInputArray: React.Dispatch<React.SetStateAction<string[]>>;
  label: INPUT_LABEL_TYPE;
};

const DynamicInputs: React.FC<DynamicInputsProps> = ({
  inputArray,
  setInputArray,
  label,
}) => {
  const [confirmedIndices, setConfirmedIndices] = useState<Set<number>>(
    new Set(),
  );

  const handleInputChange = useCallback(
    (index: number, value: string) => {
      const newInputs = [...inputArray];
      newInputs[index] = value;
      setInputArray(newInputs);
    },
    [inputArray, setInputArray],
  );

  const addInput = useCallback(() => {
    if (inputArray.length > 0 && inputArray[inputArray.length - 1] !== '') {
      setConfirmedIndices((prev) => {
        const newSet = new Set(prev);
        newSet.add(inputArray.length - 1);
        return newSet;
      });
    }

    if (inputArray.length < 5) {
      setInputArray([...inputArray, '']);
    }
  }, [setInputArray, inputArray]);

  const removeInput = useCallback(
    (indexToRemove: number) => {
      setInputArray((prev) => prev.filter((_, i) => i !== indexToRemove));

      setConfirmedIndices((prev) => {
        const newSet = new Set<number>();
        // biome-ignore lint/complexity/noForEach: <explanation>
        prev.forEach((idx) => {
          if (idx < indexToRemove) {
            newSet.add(idx);
          } else if (idx > indexToRemove) {
            newSet.add(idx - 1);
          }
        });
        return newSet;
      });
    },
    [setInputArray],
  );

  return (
    <div className="dynamic-inputs-container">
      {inputArray.map((input, index) => {
        const isConfirmed = confirmedIndices.has(index);
        const isLastInput = index === inputArray.length - 1;

        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<div key={index} className="dynamic-input-row">
            <label>
              {label}:
              <input
                id={`custom-${label}-input-${index}`}
                type="text"
                value={input}
                onChange={(inputEvent) =>
                  handleInputChange(index, inputEvent.target.value)
                }
                placeholder={LABEL_PLACEHOLDER[label]}
                readOnly={isConfirmed}
                className={isConfirmed ? 'input-confirmed' : ''}
              />
            </label>

            {isLastInput && !isConfirmed && inputArray.length < 5 && (
              <button
                type="button"
                id={`add-custom-${label.toLowerCase()}-button-${index}`}
                onClick={addInput}
                disabled={!input}
                className="add-button"
              >
                +
              </button>
            )}

            {isConfirmed && (
              <button
              type="button"
                onClick={() => removeInput(index)}
                className="remove-button"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DynamicInputs;
