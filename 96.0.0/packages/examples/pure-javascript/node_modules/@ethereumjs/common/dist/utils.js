"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGethGenesis = void 0;
const util_1 = require("@ethereumjs/util");
const enums_1 = require("./enums");
/**
 * Transforms Geth formatted nonce (i.e. hex string) to 8 byte 0x-prefixed string used internally
 * @param nonce string parsed from the Geth genesis file
 * @returns nonce as a 0x-prefixed 8 byte string
 */
function formatNonce(nonce) {
    if (!nonce || nonce === '0x0') {
        return '0x0000000000000000';
    }
    if ((0, util_1.isHexPrefixed)(nonce)) {
        return '0x' + (0, util_1.stripHexPrefix)(nonce).padStart(16, '0');
    }
    return '0x' + nonce.padStart(16, '0');
}
/**
 * Converts Geth genesis parameters to an EthereumJS compatible `CommonOpts` object
 * @param json object representing the Geth genesis file
 * @param optional mergeForkIdPostMerge which clarifies the placement of MergeForkIdTransition
 * hardfork, which by default is post merge as with the merged eth networks but could also come
 * before merge like in kiln genesis
 * @returns genesis parameters in a `CommonOpts` compliant object
 */
function parseGethParams(json, mergeForkIdPostMerge = true) {
    const { name, config, difficulty, mixHash, gasLimit, coinbase, baseFeePerGas, } = json;
    let { extraData, timestamp, nonce } = json;
    const genesisTimestamp = Number(timestamp);
    const { chainId } = config;
    // geth is not strictly putting empty fields with a 0x prefix
    if (extraData === '') {
        extraData = '0x';
    }
    // geth may use number for timestamp
    if (!(0, util_1.isHexPrefixed)(timestamp)) {
        timestamp = (0, util_1.intToHex)(parseInt(timestamp));
    }
    // geth may not give us a nonce strictly formatted to an 8 byte hex string
    if (nonce.length !== 18) {
        nonce = formatNonce(nonce);
    }
    // EIP155 and EIP158 are both part of Spurious Dragon hardfork and must occur at the same time
    // but have different configuration parameters in geth genesis parameters
    if (config.eip155Block !== config.eip158Block) {
        throw new Error('EIP155 block number must equal EIP 158 block number since both are part of SpuriousDragon hardfork and the client only supports activating the full hardfork');
    }
    const params = {
        name,
        chainId,
        networkId: chainId,
        genesis: {
            timestamp,
            gasLimit: parseInt(gasLimit),
            difficulty: parseInt(difficulty),
            nonce,
            extraData,
            mixHash,
            coinbase,
            baseFeePerGas,
        },
        hardfork: undefined,
        hardforks: [],
        bootstrapNodes: [],
        consensus: config.clique !== undefined
            ? {
                type: 'poa',
                algorithm: 'clique',
                clique: {
                    // The recent geth genesis seems to be using blockperiodseconds
                    // and epochlength for clique specification
                    // see: https://hackmd.io/PqZgMpnkSWCWv5joJoFymQ
                    period: config.clique.period ?? config.clique.blockperiodseconds,
                    epoch: config.clique.epoch ?? config.clique.epochlength,
                },
            }
            : {
                type: 'pow',
                algorithm: 'ethash',
                ethash: {},
            },
    };
    const forkMap = {
        [enums_1.Hardfork.Homestead]: { name: 'homesteadBlock' },
        [enums_1.Hardfork.Dao]: { name: 'daoForkBlock' },
        [enums_1.Hardfork.TangerineWhistle]: { name: 'eip150Block' },
        [enums_1.Hardfork.SpuriousDragon]: { name: 'eip155Block' },
        [enums_1.Hardfork.Byzantium]: { name: 'byzantiumBlock' },
        [enums_1.Hardfork.Constantinople]: { name: 'constantinopleBlock' },
        [enums_1.Hardfork.Petersburg]: { name: 'petersburgBlock' },
        [enums_1.Hardfork.Istanbul]: { name: 'istanbulBlock' },
        [enums_1.Hardfork.MuirGlacier]: { name: 'muirGlacierBlock' },
        [enums_1.Hardfork.Berlin]: { name: 'berlinBlock' },
        [enums_1.Hardfork.London]: { name: 'londonBlock' },
        [enums_1.Hardfork.MergeForkIdTransition]: { name: 'mergeForkBlock', postMerge: mergeForkIdPostMerge },
        [enums_1.Hardfork.Shanghai]: { name: 'shanghaiTime', postMerge: true, isTimestamp: true },
        [enums_1.Hardfork.ShardingForkDev]: { name: 'shardingForkTime', postMerge: true, isTimestamp: true },
    };
    // forkMapRev is the map from config field name to Hardfork
    const forkMapRev = Object.keys(forkMap).reduce((acc, elem) => {
        acc[forkMap[elem].name] = elem;
        return acc;
    }, {});
    const configHardforkNames = Object.keys(config).filter((key) => forkMapRev[key] !== undefined && config[key] !== undefined && config[key] !== null);
    params.hardforks = configHardforkNames
        .map((nameBlock) => ({
        name: forkMapRev[nameBlock],
        block: forkMap[forkMapRev[nameBlock]].isTimestamp === true || typeof config[nameBlock] !== 'number'
            ? null
            : config[nameBlock],
        timestamp: forkMap[forkMapRev[nameBlock]].isTimestamp === true && typeof config[nameBlock] === 'number'
            ? config[nameBlock]
            : undefined,
    }))
        .filter((fork) => fork.block !== null || fork.timestamp !== undefined);
    params.hardforks.sort(function (a, b) {
        return (a.block ?? Infinity) - (b.block ?? Infinity);
    });
    params.hardforks.sort(function (a, b) {
        return (a.timestamp ?? genesisTimestamp) - (b.timestamp ?? genesisTimestamp);
    });
    if (config.terminalTotalDifficulty !== undefined) {
        // Following points need to be considered for placement of merge hf
        // - Merge hardfork can't be placed at genesis
        // - Place merge hf before any hardforks that require CL participation for e.g. withdrawals
        // - Merge hardfork has to be placed just after genesis if any of the genesis hardforks make CL
        //   necessary for e.g. withdrawals
        const mergeConfig = {
            name: enums_1.Hardfork.Merge,
            ttd: config.terminalTotalDifficulty,
            block: null,
        };
        // Merge hardfork has to be placed before first hardfork that is dependent on merge
        const postMergeIndex = params.hardforks.findIndex((hf) => forkMap[hf.name]?.postMerge === true);
        if (postMergeIndex !== -1) {
            params.hardforks.splice(postMergeIndex, 0, mergeConfig);
        }
        else {
            params.hardforks.push(mergeConfig);
        }
    }
    const latestHardfork = params.hardforks.length > 0 ? params.hardforks.slice(-1)[0] : undefined;
    params.hardfork = latestHardfork?.name;
    params.hardforks.unshift({ name: enums_1.Hardfork.Chainstart, block: 0 });
    return params;
}
/**
 * Parses a genesis.json exported from Geth into parameters for Common instance
 * @param json representing the Geth genesis file
 * @param name optional chain name
 * @returns parsed params
 */
function parseGethGenesis(json, name, mergeForkIdPostMerge) {
    try {
        if (['config', 'difficulty', 'gasLimit', 'alloc'].some((field) => !(field in json))) {
            throw new Error('Invalid format, expected geth genesis fields missing');
        }
        if (name !== undefined) {
            json.name = name;
        }
        return parseGethParams(json, mergeForkIdPostMerge);
    }
    catch (e) {
        throw new Error(`Error parsing parameters file: ${e.message}`);
    }
}
exports.parseGethGenesis = parseGethGenesis;
//# sourceMappingURL=utils.js.map