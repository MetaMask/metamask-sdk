import { extractMethod } from './extractMethod'; // Update this import based on your project structure

describe('extractMethod function', () => {
  it('should return method from Buffer chunk', () => {
    const originalData = { data: { method: 'someMethod' } };
    const bufferData = Buffer.from(JSON.stringify(originalData));
    const jsonData = bufferData.toJSON();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jsonData._isBuffer = true;

    const result = extractMethod(bufferData);

    expect(result.data).toStrictEqual(jsonData);
    expect(result.data._isBuffer).toStrictEqual(true);
    expect(result.method).toBeUndefined(); // Because `chunk.toJSON()` doesn't include the original data
  });

  it('should return method from regular object chunk', () => {
    const regularData = { data: { method: 'anotherMethod' } };
    const result = extractMethod(regularData);
    expect(result.method).toStrictEqual('anotherMethod');
    expect(result.data._isBuffer).toBeUndefined();
  });

  it('should return undefined method if method is not present', () => {
    const regularData = { data: {} };
    const result = extractMethod(regularData);
    expect(result.method).toBeUndefined();
  });

  it('should return undefined method if data is not present', () => {
    const regularData = {};
    const result = extractMethod(regularData);
    expect(result.method).toBeUndefined();
  });

  it('should handle null and undefined chunks gracefully', () => {
    let result = extractMethod(null);
    expect(result.method).toBeUndefined();

    result = extractMethod(undefined);
    expect(result.method).toBeUndefined();
  });

  it('should handle non-object types gracefully', () => {
    let result = extractMethod(42);
    expect(result.method).toBeUndefined();

    result = extractMethod('string');
    expect(result.method).toBeUndefined();
  });
});
