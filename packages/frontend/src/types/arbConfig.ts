// Arbitrum Node Types
export type ArbNodeType = 'full' | 'archive' | 'validator';
export type ArbChainName = 'arb1' | 'nova' | 'sepolia';
export type ArbPruneMode = 'full' | 'validator' | 'archive';
export type ArbStakerStrategy = 'Defensive' | 'MakeNodes' | 'ResolveNodes' | 'StakeLatest';
export type ArbLogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export interface ArbConfig {
  deploymentName: string;
  nodeName: string;
  nodeType: ArbNodeType;
  namespace: string;
  image: {
    repository: string;
    tag: string;
    pullPolicy: 'Always' | 'IfNotPresent' | 'Never';
  };
  service: {
    type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
    ports: {
      http: { port: number };
      ws: { port: number };
      metrics: { port: number };
      p2p: { port: number };
    };
  };
  config: {
    chainId: number;
    chainName: ArbChainName;
    parentChainUrl: string;
    parentChainBeaconUrl?: string;
    pruneMode: ArbPruneMode;
    executionCachingArchive: boolean;
    initLatest?: 'archive' | 'pruned' | 'genesis';
    initUrl?: string;
    httpApi: string;
    httpAddr: string;
    httpPort: number;
    httpVhosts: string;
    httpCorsdomain: string;
    wsEnable: boolean;
    wsAddr: string;
    wsPort: number;
    wsApi: string;
    wsOrigins: string;
    feedInputUrl: string;
    feedInputSecondaryUrl?: string;
    stakerEnable: boolean;
    stakerStrategy?: ArbStakerStrategy;
    stakerParentChainWalletPassword?: string;
    stakerParentChainWalletPrivateKey?: string;
    cachingTrieTimeLimit: string;
    cachingSnapshotKeep: number;
    cachingSnapshotRestore: boolean;
    metricsEnable: boolean;
    metricsPort: number;
    metricsAddr: string;
    logLevel: ArbLogLevel;
    logType: 'plaintext' | 'json';
    p2pMaxPeers: number;
    p2pNoDiscovery: boolean;
    nodeDataAvailabilityEnable: boolean;
  };
  resources: {
    requests: {
      cpu: string;
      memory: string;
    };
    limits?: {
      cpu?: string;
      memory?: string;
    };
  };
  persistence: {
    enabled: boolean;
    storageClass: string;
    size: string;
  };
  snapshot?: {
    enabled: boolean;
    url?: string;
    checksum?: string;
  };
  monitoring?: {
    enabled: boolean;
    prometheusOperator: boolean;
    grafanaDashboard: boolean;
  };
  livenessProbe?: {
    enabled: boolean;
    initialDelaySeconds: number;
    periodSeconds: number;
    timeoutSeconds: number;
    failureThreshold: number;
  };
  readinessProbe?: {
    enabled: boolean;
    initialDelaySeconds: number;
    periodSeconds: number;
    timeoutSeconds: number;
    failureThreshold: number;
  };
}

export const DEFAULT_ARB_CONFIG: ArbConfig = {
  deploymentName: 'arbitrum-node',
  nodeName: 'arbitrum-node',
  nodeType: 'full',
  namespace: 'default',
  image: {
    repository: 'offchainlabs/nitro-node',
    tag: 'v3.8.0-62c0aa7',
    pullPolicy: 'IfNotPresent',
  },
  service: {
    type: 'ClusterIP',
    ports: {
      http: { port: 8547 },
      ws: { port: 8548 },
      metrics: { port: 6070 },
      p2p: { port: 9642 },
    },
  },
  config: {
    chainId: 42161,
    chainName: 'arb1',
    parentChainUrl: 'https://ethereum-rpc.publicnode.com',
    pruneMode: 'full',
    executionCachingArchive: false,
    httpApi: 'net,web3,eth,arb',
    httpAddr: '0.0.0.0',
    httpPort: 8547,
    httpVhosts: '*',
    httpCorsdomain: '*',
    wsEnable: true,
    wsAddr: '0.0.0.0',
    wsPort: 8548,
    wsApi: 'net,web3,eth,arb',
    wsOrigins: '*',
    feedInputUrl: 'wss://arb1.arbitrum.io/feed',
    stakerEnable: false,
    cachingTrieTimeLimit: '30m',
    cachingSnapshotKeep: 128,
    cachingSnapshotRestore: false,
    metricsEnable: true,
    metricsPort: 6070,
    metricsAddr: '0.0.0.0',
    logLevel: 'info',
    logType: 'plaintext',
    p2pMaxPeers: 50,
    p2pNoDiscovery: false,
    nodeDataAvailabilityEnable: true,
  },
  resources: {
    requests: {
      cpu: '4',
      memory: '16Gi',
    },
  },
  persistence: {
    enabled: true,
    storageClass: 'standard',
    size: '2Ti',
  },
};
