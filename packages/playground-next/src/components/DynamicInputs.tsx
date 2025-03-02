import React, { useCallback } from 'react';

export enum INPUT_LABEL_TYPE {
  ADDRESS = 'Address',
  SCOPE = 'Scope',
}

const LABEL_PLACEHOLDER = {
  [INPUT_LABEL_TYPE.ADDRESS]: '0x483b...5f97',
  [INPUT_LABEL_TYPE.SCOPE]: 'eip155:1',
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
  const handleInputChange = useCallback(
    (index: number, value: string) => {
      const newInputs = [...inputArray];
      newInputs[index] = value;
      setInputArray(newInputs);
    },
    [inputArray, setInputArray],
  );

  const addInput = useCallback(() => {
    if (inputArray.length < 5) {
      setInputArray([...inputArray, '']);
    }
  }, [setInputArray, inputArray]);

  return (
    <div>
      {inputArray.map((input, index) => (
        <div key={index}>
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
            />
          </label>
          {index === inputArray.length - 1 && inputArray.length < 5 && (
            <button
              id={`add-custom-${label.toLowerCase()}-button-${index}`}
              onClick={addInput}
              disabled={!input}
            >
              +
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default DynamicInputs;
