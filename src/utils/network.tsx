import URL from 'url-parse';
import AppConstants from '../core/constants';
import { MAINNET, ROPSTEN, KOVAN, RINKEBY, GOERLI, RPC } from '../constants/network';
import {
	NETWORK_ERROR_MISSING_NETWORK_ID,
	NETWORK_ERROR_UNKNOWN_NETWORK_ID,
	NETWORK_ERROR_MISSING_CHAIN_ID,
} from '../constants/errror';
import { util } from '@metamask/controllers';
import Engine from '../core/engine';
import { toLowerCaseEquals } from './general';
import { fastSplit } from '../utils/number';
/**
 * List of the supported networks
 * including name, id, and color
 *
 * This values are used in certain places like
 * navbar and the network switcher.
 */
const NetworkList: any = {
	[MAINNET]: {
		name: 'Ethereum Main Network',
		shortName: 'Ethereum',
		networkId: 1,
		chainId: 1,
		hexChainId: '0x1',
		color: '#3cc29e',
		networkType: 'mainnet',
	},
	[ROPSTEN]: {
		name: 'Ropsten Test Network',
		shortName: 'Ropsten',
		networkId: 3,
		chainId: 3,
		hexChainId: '0x3',
		color: '#ff4a8d',
		networkType: 'ropsten',
	},
	[KOVAN]: {
		name: 'Kovan Test Network',
		shortName: 'Kovan',
		networkId: 42,
		chainId: 42,
		hexChainId: '0x2a',
		color: '#7057ff',
		networkType: 'kovan',
	},
	[RINKEBY]: {
		name: 'Rinkeby Test Network',
		shortName: 'Rinkeby',
		networkId: 4,
		chainId: 4,
		hexChainId: '0x4',
		color: '#f6c343',
		networkType: 'rinkeby',
	},
	[GOERLI]: {
		name: 'Goerli Test Network',
		shortName: 'Goerli',
		networkId: 5,
		chainId: 5,
		hexChainId: '0x5',
		color: '#3099f2',
		networkType: 'goerli',
	},
	[RPC]: {
		name: 'Private Network',
		shortName: 'Private',
		color: '#4099f2',
		networkType: 'rpc',
	},
};

const NetworkListKeys = Object.keys(NetworkList);

export default NetworkList;

export const getAllNetworks = () => NetworkListKeys.filter((name) => name !== RPC);

export const isMainNet = (network: any) => network?.provider?.type === MAINNET || network === String(1);

export const getDecimalChainId = (chainId: any) => {
	if (!chainId || typeof chainId !== 'string' || !chainId.startsWith('0x')) {
		return chainId;
	}
	return parseInt(chainId, 16).toString(10);
};

export const isMainnetByChainId = (chainId: any) => getDecimalChainId(String(chainId)) === String(1);

export const getNetworkName = (id: any) => NetworkListKeys.find((key) => NetworkList[key].networkId === Number(id));

export function getNetworkTypeById(id: any) {
	if (!id) {
		throw new Error(NETWORK_ERROR_MISSING_NETWORK_ID);
	}
	const network = NetworkListKeys.filter((key) => NetworkList[key].networkId === parseInt(id, 10));
	if (network.length > 0) {
		return network[0];
	}

	throw new Error(`${NETWORK_ERROR_UNKNOWN_NETWORK_ID} ${id}`);
}

export function getDefaultNetworkByChainId(chainId: any) {
	if (!chainId) {
		throw new Error(NETWORK_ERROR_MISSING_CHAIN_ID);
	}

	let returnNetwork;

	getAllNetworks().forEach((type: any) => {
		if (toLowerCaseEquals(String(NetworkList[type].chainId), chainId)) {
			returnNetwork = NetworkList[type];
		}
	});

	return returnNetwork;
}

export function hasBlockExplorer(key: any) {
	return key.toLowerCase() !== RPC;
}

export function isKnownNetwork(id:any) {
	const knownNetworks = NetworkListKeys.map((key) => NetworkList[key].networkId).filter((id) => id !== undefined);
	return knownNetworks.includes(parseInt(id, 10));
}

export function isprivateConnection(hostname: any) {
	return (
		hostname === 'localhost' ||
		/(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/.test(hostname)
	);
}

/**
 * Returns custom block explorer for specific rpcTarget
 *
 * @param {string} rpcTarget
 * @param {array<object>} frequentRpcList
 */
export function findBlockExplorerForRpc(rpcTarget: any, frequentRpcList: any) {
	const frequentRpc = frequentRpcList.find(({ rpcUrl }: { rpcUrl: any }) => rpcTarget === rpcUrl);
	if (frequentRpc) {
		return frequentRpc.rpcPrefs && frequentRpc.rpcPrefs.blockExplorerUrl;
	}
	return undefined;
}

/**
 * From block explorer url, get rendereable name or undefined
 *
 * @param {string} blockExplorerUrl - block explorer url
 */
export function getBlockExplorerName(blockExplorerUrl: any) {
	if (!blockExplorerUrl) return undefined;
	const hostname = new URL(blockExplorerUrl).hostname;
	if (!hostname) return undefined;
	const tempBlockExplorerName = fastSplit(hostname);
	if (!tempBlockExplorerName || !tempBlockExplorerName[0]) return undefined;
	return tempBlockExplorerName[0].toUpperCase() + tempBlockExplorerName.slice(1);
}

/**
 * Checks whether the given number primitive chain ID is safe.
 * Because some cryptographic libraries we use expect the chain ID to be a
 * number primitive, it must not exceed a certain size.
 *
 * @param {number} chainId - The chain ID to check for safety.
 * @returns {boolean} Whether the given chain ID is safe.
 */
export function isSafeChainId(chainId: any) {
	return Number.isSafeInteger(chainId) && chainId > 0 && chainId <= AppConstants.MAX_SAFE_CHAIN_ID;
}

/**
 * Checks whether the given value is a 0x-prefixed, non-zero, non-zero-padded,
 * hexadecimal string.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} True if the value is a correctly formatted hex string,
 * false otherwise.
 */
export function isPrefixedFormattedHexString(value: any) {
	if (typeof value !== 'string') {
		return false;
	}
	return /^0x[1-9a-f]+[0-9a-f]*$/iu.test(value);
}

export const getNetworkNonce = async ({ from }: {from: any}) => {
	const { TransactionController } = Engine.context;
	const networkNonce = await util.query(TransactionController.ethQuery, 'getTransactionCount', [from, 'pending']);
	return parseInt(networkNonce, 16);
};

export function blockTagParamIndex(payload: any) {
	switch (payload.method) {
		// blockTag is at index 2
		case 'eth_getStorageAt':
			return 2;
		// blockTag is at index 1
		case 'eth_getBalance':
		case 'eth_getCode':
		case 'eth_getTransactionCount':
		case 'eth_call':
			return 1;
		// blockTag is at index 0
		case 'eth_getBlockByNumber':
			return 0;
		// there is no blockTag
		default:
			return undefined;
	}
}