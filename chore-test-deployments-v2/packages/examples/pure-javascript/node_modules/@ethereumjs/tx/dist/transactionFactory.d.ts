/// <reference types="node" />
import type { AccessListEIP2930TxData, FeeMarketEIP1559TxData, TxData, TxOptions, TypedTransaction } from './types';
export declare class TransactionFactory {
    private constructor();
    /**
     * Create a transaction from a `txData` object
     *
     * @param txData - The transaction data. The `type` field will determine which transaction type is returned (if undefined, creates a legacy transaction)
     * @param txOptions - Options to pass on to the constructor of the transaction
     */
    static fromTxData(txData: TxData | AccessListEIP2930TxData | FeeMarketEIP1559TxData, txOptions?: TxOptions): TypedTransaction;
    /**
     * This method tries to decode serialized data.
     *
     * @param data - The data Buffer
     * @param txOptions - The transaction options
     */
    static fromSerializedData(data: Buffer, txOptions?: TxOptions): TypedTransaction;
    /**
     * When decoding a BlockBody, in the transactions field, a field is either:
     * A Buffer (a TypedTransaction - encoded as TransactionType || rlp(TransactionPayload))
     * A Buffer[] (Legacy Transaction)
     * This method returns the right transaction.
     *
     * @param data - A Buffer or Buffer[]
     * @param txOptions - The transaction options
     */
    static fromBlockBodyData(data: Buffer | Buffer[], txOptions?: TxOptions): TypedTransaction;
    /**
     *  Method to retrieve a transaction from the provider
     * @param provider - An Ethers JsonRPCProvider
     * @param txHash - Transaction hash
     * @param txOptions - The transaction options
     * @returns the transaction specified by `txHash`
     */
    static fromEthersProvider(provider: string | any, txHash: string, txOptions?: TxOptions): Promise<TypedTransaction>;
    /**
     * Method to decode data retrieved from RPC, such as `eth_getTransactionByHash`
     * Note that this normalizes some of the parameters
     * @param txData The RPC-encoded data
     * @param txOptions The transaction options
     * @returns
     */
    static fromRPCTx(txData: TxData | AccessListEIP2930TxData | FeeMarketEIP1559TxData, txOptions?: TxOptions): Promise<TypedTransaction>;
}
//# sourceMappingURL=transactionFactory.d.ts.map