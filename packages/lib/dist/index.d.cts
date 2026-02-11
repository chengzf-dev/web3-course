import * as wagmi from 'wagmi';
import * as viem_chains from 'viem/chains';
import * as viem from 'viem';

type ActionRole = "STUDENT" | "AUTHOR" | "ADMIN";
declare function getActionAuth(address?: string, requiredRoles?: ActionRole[]): {
    ok: boolean;
    reason: string;
    token?: undefined;
    role?: undefined;
} | {
    ok: boolean;
    token: string;
    role: "STUDENT" | "AUTHOR" | "ADMIN";
    reason?: undefined;
};

declare const API_BASE: string;
type ApiCourse = {
    id: string;
    title: string;
    description: string;
    priceYd: string;
    authorAddress: string;
    status?: string;
    owned?: boolean;
    content?: string;
};
type AuthUser = {
    address: string;
    role: "STUDENT" | "AUTHOR" | "ADMIN";
    status: "ACTIVE" | "FROZEN";
};
declare function fetchCourses(): Promise<ApiCourse[]>;
declare function fetchCourse(id: string): Promise<ApiCourse>;
declare function fetchCourseContent(id: string, address: string): Promise<string>;
declare function createCourse(input: {
    title: string;
    description: string;
    content: string;
    priceYd: string;
    authorAddress: string;
}): Promise<{
    id: string;
    txIntent: string;
}>;
declare function updateCourse(id: string, input: {
    title?: string;
    description?: string;
    content?: string;
    priceYd?: string;
}, token: string): Promise<ApiCourse>;
declare function unpublishCourse(id: string, token: string): Promise<{
    ok: boolean;
}>;
declare function requestPublishCourse(id: string, token: string): Promise<{
    ok: boolean;
}>;
declare function recordPurchase(input: {
    txHash: string;
    courseId: string;
    buyer: string;
    token?: string;
}): Promise<{
    ok: boolean;
}>;
declare function requestAuthChallenge(address: string): Promise<{
    message: string;
    nonce: string;
    expiresAt: number;
}>;
declare function verifyAuthSignature(input: {
    address: string;
    message: string;
    signature: string;
    nonce: string;
}): Promise<{
    token: string;
    expiresAt: number;
    user: AuthUser;
}>;
declare function fetchMe(token: string): Promise<AuthUser>;
declare function adminApproveCourse(id: string, token: string): Promise<{
    ok: boolean;
}>;
declare function adminUnpublishCourse(id: string, token: string): Promise<{
    ok: boolean;
}>;
declare function adminFreezeUser(address: string, token: string): Promise<{
    ok: boolean;
}>;

type AuthSession = {
    token: string;
    expiresAt: number;
    user: AuthUser;
};
declare function readAuthSession(): AuthSession | null;
declare function writeAuthSession(session: AuthSession): void;
declare function clearAuthSession(): void;

declare const contracts: {
    chainId: number;
    network: string;
    addresses: {
        YDToken: `0x${string}`;
        CourseCertificate: `0x${string}`;
        Courses: `0x${string}`;
        Exchange: `0x${string}`;
    };
    abis: {
        YDToken: unknown[];
        CourseCertificate: unknown[];
        Courses: unknown[];
        Exchange: unknown[];
    };
};

type Course = {
    id: string;
    title: string;
    description: string;
    priceYd: string;
    authorAddress: string;
    onchainExists?: boolean;
    status?: string;
    owned: boolean;
    progress: number;
};
type CourseDetail = Course & {
    content: string | null;
};
type AuthorCourse = {
    id: string;
    title: string;
    description: string;
    priceYd: string;
    authorAddress: string;
    onchainExists?: boolean;
    status?: string;
};

declare function getCourses(): Course[];
declare function getCourseById(id: string): CourseDetail | null;

type MetaMaskNetworkConfig = {
    chainId: `0x${string}`;
    chainName: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls?: string[];
};
declare const NETWORK_CONFIGS: Record<string, MetaMaskNetworkConfig>;
declare function getNetworkName(chainId: string): string;
declare function getAccounts(): Promise<string[]>;
declare function requestAccounts(): Promise<string[]>;
declare function requestAccountPicker(): Promise<string[]>;
declare function getCurrentChainId(): Promise<string>;
declare function getBalance(account: string): Promise<{
    wei: string;
    eth: number;
    formatted: string;
}>;
declare function getAccountsWithBalance(): Promise<{
    index: number;
    address: string;
    balance: string;
}[]>;
declare function switchToNetwork(networkName: string): Promise<void>;
declare function onMetaMaskEvent(event: "accountsChanged" | "chainChanged", handler: (...args: unknown[]) => void): () => void;

declare function useMounted(): boolean;

declare const wagmiConfig: wagmi.Config<readonly [{
    id: number;
    rpcUrls: {
        default: {
            http: string[];
        };
    };
    blockExplorers?: {
        [key: string]: {
            name: string;
            url: string;
            apiUrl?: string | undefined;
        };
        default: {
            name: string;
            url: string;
            apiUrl?: string | undefined;
        };
    } | undefined;
    contracts?: viem_chains.Prettify<{
        [key: string]: viem.ChainContract | {
            [sourceId: number]: viem.ChainContract | undefined;
        } | undefined;
    } & {
        ensRegistry?: viem.ChainContract | undefined;
        ensUniversalResolver?: viem.ChainContract | undefined;
        multicall3?: viem.ChainContract | undefined;
    }> | undefined;
    name: "Hardhat";
    nativeCurrency: {
        readonly decimals: 18;
        readonly name: "Ether";
        readonly symbol: "ETH";
    };
    sourceId?: number | undefined;
    testnet?: boolean | undefined;
    custom?: Record<string, unknown> | undefined;
    fees?: viem.ChainFees<undefined> | undefined;
    formatters?: undefined;
    serializers?: viem.ChainSerializers<undefined, viem.TransactionSerializable> | undefined;
}], {
    [x: number]: viem.HttpTransport;
}>;

export { API_BASE, type ActionRole, type ApiCourse, type AuthSession, type AuthUser, type AuthorCourse, type Course, type CourseDetail, type MetaMaskNetworkConfig, NETWORK_CONFIGS, adminApproveCourse, adminFreezeUser, adminUnpublishCourse, clearAuthSession, contracts, createCourse, fetchCourse, fetchCourseContent, fetchCourses, fetchMe, getAccounts, getAccountsWithBalance, getActionAuth, getBalance, getCourseById, getCourses, getCurrentChainId, getNetworkName, onMetaMaskEvent, readAuthSession, recordPurchase, requestAccountPicker, requestAccounts, requestAuthChallenge, requestPublishCourse, switchToNetwork, unpublishCourse, updateCourse, useMounted, verifyAuthSignature, wagmiConfig, writeAuthSession };
