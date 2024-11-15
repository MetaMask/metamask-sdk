import { StreamProvider } from '../StreamProvider';
export declare type ExtensionType = 'stable' | 'flask' | 'beta' | string;
/**
 * Creates an external extension provider for the given extension type or ID.
 *
 * @param typeOrId - The extension type or ID.
 * @returns The external extension provider.
 */
export declare function createExternalExtensionProvider(typeOrId?: ExtensionType): StreamProvider;
//# sourceMappingURL=createExternalExtensionProvider.d.ts.map