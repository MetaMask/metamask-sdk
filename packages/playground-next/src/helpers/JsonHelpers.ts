// packages/multichainapi/src/utils/JsonHelpers.ts
import type {
  ContentDescriptorObject,
  ExampleObject,
  ExamplePairingObject,
  MethodObject,
} from '@open-rpc/meta-schema';
import type { Json } from '@metamask/utils';

const paramsToObj = (
  params: Record<string, unknown>[],
  methodParams: ContentDescriptorObject[],
): Record<string, unknown> => {
  return params.reduce((acc, val, i) => {
    const paramName = methodParams[i]?.name;
    if (paramName) {
      acc[paramName] = val;
    }
    return acc;
  }, {});
};

export const openRPCExampleToJSON = (method: MethodObject) => {
  if (!method.examples || method.examples.length === 0) {
    return {
      method: method.name,
      params: [],
    };
  }
  const examplePairing = method.examples?.[0];
  const ex = examplePairing as ExamplePairingObject;
  const paramsFromExample = ex.params.map(
    (example) => (example as ExampleObject).value,
  );
  const params =
    method.paramStructure === 'by-name'
      ? paramsToObj(
          paramsFromExample,
          method.params as ContentDescriptorObject[],
        )
      : paramsFromExample;
  return {
    method: method.name,
    params,
  } as Json;
};

export const truncateJSON = (
  json: Json,
  maxLength = 100,
): { text: string; truncated: boolean } => {
  const stringified = JSON.stringify(json).slice(0, maxLength);
  if (stringified.length <= maxLength) {
    return { text: stringified, truncated: false };
  }
  return {
    text: stringified.slice(0, maxLength),
    truncated: true,
  };
};
