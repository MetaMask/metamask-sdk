import SafeEventEmitter from '.';
describe('SafeEventEmitter', () => {
    it('can be constructed without error', () => {
        expect(new SafeEventEmitter()).toBeDefined();
    });
    it('can emit a value with no listeners', () => {
        const see = new SafeEventEmitter();
        expect(see.emit('foo', 42)).toBe(false);
    });
    it('can emit a value with 1 listeners', () => {
        expect.assertions(2);
        const see = new SafeEventEmitter();
        see.on('foo', (x) => expect(x).toBe(42));
        expect(see.emit('foo', 42)).toBe(true);
    });
    it('can emit a value with 2 listeners', () => {
        expect.assertions(3);
        const see = new SafeEventEmitter();
        see.on('foo', (x) => expect(x).toBe(42));
        see.on('foo', (x) => expect(x).toBe(42));
        expect(see.emit('foo', 42)).toBe(true);
    });
    it('returns false when _events is somehow undefined', () => {
        const see = new SafeEventEmitter();
        see.on('foo', () => { });
        delete see._events;
        expect(see.emit('foo', 42)).toBe(false);
    });
    it('throws error from handler after setTimeout', () => {
        jest.useFakeTimers();
        const see = new SafeEventEmitter();
        see.on('boom', () => {
            throw new Error('foo');
        });
        expect(() => {
            see.emit('boom');
        }).not.toThrow();
        expect(() => {
            jest.runAllTimers();
        }).toThrow('foo');
    });
    it('throws error emitted when there is no error handler', () => {
        const see = new SafeEventEmitter();
        expect(() => {
            see.emit('error', new Error('foo'));
        }).toThrow('foo');
    });
    it('throws error emitted when there is no error handler AND _events is somehow undefined', () => {
        const see = new SafeEventEmitter();
        delete see._events;
        expect(() => {
            see.emit('error', new Error('foo'));
        }).toThrow('foo');
    });
    it('throws default error when there is no error handler and error event emitted', () => {
        const see = new SafeEventEmitter();
        expect(() => {
            see.emit('error');
        }).toThrow('Unhandled error.');
    });
    it('throws error when there is no error handler and error event emitted', () => {
        const see = new SafeEventEmitter();
        expect(() => {
            see.emit('error', { message: 'foo' });
        }).toThrow('Unhandled error. (foo)');
    });
});
//# sourceMappingURL=index.test.mjs.map