import type {
  ContentDescriptorObject,
  ExampleObject,
  ExamplePairingObject,
  MethodObject,
} from '@open-rpc/meta-schema';

const paramsToObj = (
  params: any[],
  methodParams: ContentDescriptorObject[],
): any => {
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
  };
};

export const truncateJSON = (
  json: any,
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
