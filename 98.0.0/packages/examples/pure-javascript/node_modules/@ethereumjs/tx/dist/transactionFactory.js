"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionFactory = void 0;
const util_1 = require("@ethereumjs/util");
const eip1559Transaction_1 = require("./eip1559Transaction");
const eip2930Transaction_1 = require("./eip2930Transaction");
const fromRpc_1 = require("./fromRpc");
const legacyTransaction_1 = require("./legacyTransaction");
class TransactionFactory {
    // It is not possible to instantiate a TransactionFactory object.
    constructor() { }
    /**
     * Create a transaction from a `txData` object
     *
     * @param txData - The transaction data. The `type` field will determine which transaction type is returned (if undefined, creates a legacy transaction)
     * @param txOptions - Options to pass on to the constructor of the transaction
     */
    static fromTxData(txData, txOptions = {}) {
        if (!('type' in txData) || txData.type === undefined) {
            // Assume legacy transaction
            return legacyTransaction_1.Transaction.fromTxData(txData, txOptions);
        }
        else {
            const txType = Number((0, util_1.bufferToBigInt)((0, util_1.toBuffer)(txData.type)));
            if (txType === 0) {
                return legacyTransaction_1.Transaction.fromTxData(txData, txOptions);
            }
            else if (txType === 1) {
                return eip2930Transaction_1.AccessListEIP2930Transaction.fromTxData(txData, txOptions);
            }
            else if (txType === 2) {
                return eip1559Transaction_1.FeeMarketEIP1559Transaction.fromTxData(txData, txOptions);
            }
            else {
                throw new Error(`Tx instantiation with type ${txType} not supported`);
            }
        }
    }
    /**
     * This method tries to decode serialized data.
     *
     * @param data - The data Buffer
     * @param txOptions - The transaction options
     */
    static fromSerializedData(data, txOptions = {}) {
        if (data[0] <= 0x7f) {
            // Determine the type.
            switch (data[0]) {
                case 1:
                    return eip2930Transaction_1.AccessListEIP2930Transaction.fromSerializedTx(data, txOptions);
                case 2:
                    return eip1559Transaction_1.FeeMarketEIP1559Transaction.fromSerializedTx(data, txOptions);
                default:
                    throw new Error(`TypedTransaction with ID ${data[0]} unknown`);
            }
        }
        else {
            return legacyTransaction_1.Transaction.fromSerializedTx(data, txOptions);
        }
    }
    /**
     * When decoding a BlockBody, in the transactions field, a field is either:
     * A Buffer (a TypedTransaction - encoded as TransactionType || rlp(TransactionPayload))
     * A Buffer[] (Legacy Transaction)
     * This method returns the right transaction.
     *
     * @param data - A Buffer or Buffer[]
     * @param txOptions - The transaction options
     */
    static fromBlockBodyData(data, txOptions = {}) {
        if (Buffer.isBuffer(data)) {
            return this.fromSerializedData(data, txOptions);
        }
        else if (Array.isArray(data)) {
            // It is a legacy transaction
            return legacyTransaction_1.Transaction.fromValuesArray(data, txOptions);
        }
        else {
            throw new Error('Cannot decode transaction: unknown type input');
        }
    }
    /**
     *  Method to retrieve a transaction from the provider
     * @param provider - An Ethers JsonRPCProvider
     * @param txHash - Transaction hash
     * @param txOptions - The transaction options
     * @returns the transaction specified by `txHash`
     */
    static async fromEthersProvider(provider, txHash, txOptions) {
        const prov = (0, util_1.getProvider)(provider);
        const txData = await (0, util_1.fetchFromProvider)(prov, {
            method: 'eth_getTransactionByHash',
            params: [txHash],
        });
        if (txData === null) {
            throw new Error('No data returned from provider');
        }
        return TransactionFactory.fromRPCTx(txData, txOptions);
    }
    /**
     * Method to decode data retrieved from RPC, such as `eth_getTransactionByHash`
     * Note that this normalizes some of the parameters
     * @param txData The RPC-encoded data
     * @param txOptions The transaction options
     * @returns
     */
    static async fromRPCTx(txData, txOptions = {}) {
        return TransactionFactory.fromTxData((0, fromRpc_1.normalizeTxParams)(txData), txOptions);
    }
}
exports.TransactionFactory = TransactionFactory;
//# sourceMappingURL=transactionFactory.js.map