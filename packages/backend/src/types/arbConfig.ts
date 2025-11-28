import { z } from 'zod';
import {
  BaseChainConfigSchema,
  ServiceConfigSchema,
  ImageConfigSchema,
  ResourcesSchema,
  PersistenceSchema,
  MonitoringSchema,
  ProbeSchema
} from './common';

// Arbitrum-specific node configuration
export const ArbNodeConfigSchema = z.object({
  // Arbitrum Chain Settings
  chainId: z.number().default(42161), // 42161 for Arbitrum One, 42170 for Nova
  chainName: z.enum(['arb1', 'nova', 'sepolia']).default('arb1'),

  // Parent Chain (L1) Configuration
  parentChainUrl: z.string().default('https://ethereum-rpc.publicnode.com'),
  parentChainBeaconUrl: z.string().optional(),

  // Node Type & Pruning
  pruneMode: z.enum(['full', 'validator', 'archive']).default('full'),
  executionCachingArchive: z.boolean().default(false), // For archive nodes

  // Snapshot initialization
  initLatest: z.enum(['archive', 'pruned', 'genesis']).optional(),
  initUrl: z.string().optional(),

  // HTTP API Configuration
  httpApi: z.string().default('net,web3,eth,arb'),
  httpAddr: z.string().default('0.0.0.0'),
  httpPort: z.number().default(8547),
  httpVhosts: z.string().default('*'),
  httpCorsdomain: z.string().default('*'),

  // WebSocket Configuration
  wsEnable: z.boolean().default(true),
  wsAddr: z.string().default('0.0.0.0'),
  wsPort: z.number().default(8548),
  wsApi: z.string().default('net,web3,eth,arb'),
  wsOrigins: z.string().default('*'),

  // Sequencer Feed
  feedInputUrl: z.string().default('wss://arb1.arbitrum.io/feed'),
  feedInputSecondaryUrl: z.string().optional(),

  // Validator/Staker Configuration
  stakerEnable: z.boolean().default(false),
  stakerStrategy: z.enum(['Defensive', 'MakeNodes', 'ResolveNodes', 'StakeLatest']).optional(),
  stakerParentChainWalletPassword: z.string().optional(),
  stakerParentChainWalletPrivateKey: z.string().optional(),

  // Performance & Caching
  cachingTrieTimeLimit: z.string().default('30m'),
  cachingSnapshotKeep: z.number().default(128),
  cachingSnapshotRestore: z.boolean().default(false),

  // Metrics
  metricsEnable: z.boolean().default(true),
  metricsPort: z.number().default(6070),
  metricsAddr: z.string().default('0.0.0.0'),

  // Logging
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  logType: z.enum(['plaintext', 'json']).default('plaintext'),

  // P2P Configuration
  p2pMaxPeers: z.number().default(50),
  p2pNoDiscovery: z.boolean().default(false),

  // Advanced
  nodeDataAvailabilityEnable: z.boolean().default(true),
  nodeRpc: z.object({
    maxBatchSize: z.number().default(100),
    maxRequestContentLength: z.number().default(524288),
  }).optional(),
});

export type ArbNodeType = 'full' | 'archive' | 'validator';

export const ArbConfigSchema = BaseChainConfigSchema.extend({
  nodeType: z.enum(['full', 'archive', 'validator']).default('full'),
  image: ImageConfigSchema.default({
    repository: 'offchainlabs/nitro-node',
    tag: 'v3.8.0-62c0aa7',
    pullPolicy: 'IfNotPresent',
  }),
  service: ServiceConfigSchema,
  config: ArbNodeConfigSchema,
  resources: ResourcesSchema,
  persistence: PersistenceSchema,
  monitoring: MonitoringSchema.optional(),
  snapshot: z.object({
    enabled: z.boolean().default(false),
    url: z.string().optional(),
    checksum: z.string().optional(),
  }).optional(),
  livenessProbe: ProbeSchema.optional(),
  readinessProbe: ProbeSchema.optional(),
});

export type ArbConfig = z.infer<typeof ArbConfigSchema>;
export type ArbNodeConfig = z.infer<typeof ArbNodeConfigSchema>;

// Default configuration
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
