import { z } from 'zod';
import { BaseChainConfigSchema } from './common';

// Ethereum-specific node configuration
export const EthNodeConfigSchema = z.object({
  syncMode: z.enum(['snap', 'full', 'light']).default('snap'),
  gcMode: z.enum(['full', 'archive']).default('full'),
  stateScheme: z.enum(['hash', 'path']).default('path'),
  cache: z.number().min(1024).default(4096), // MB
  cacheDatabase: z.number().min(0).max(100).default(50), // percentage
  cacheGc: z.number().min(0).max(100).default(25), // percentage
  cacheSnapshot: z.number().min(0).max(100).default(10), // percentage
  snapshot: z.boolean().default(true),
  historyState: z.number().min(0).default(90000), // 0 for full archive
  historyTransactions: z.number().min(0).default(2350000),
  verbosity: z.number().min(0).max(5).default(3),

  // RPC/WS APIs
  httpApi: z.string().default('eth,net,web3'),
  wsApi: z.string().default('eth,net,web3'),
  httpVirtualHosts: z.string().default('*'),
  httpCorsOrigins: z.string().default('*'),

  // Auth RPC (for consensus clients)
  authrpcEnabled: z.boolean().default(false),
  authrpcPort: z.number().min(1).max(65535).default(8551),
  authrpcVhosts: z.string().default('localhost'),

  // Metrics
  metricsEnabled: z.boolean().default(true),
  metricsInfluxdb: z.boolean().default(false),

  // Network
  networkId: z.number().default(1), // 1 for mainnet

  // Transaction pool
  txpool: z.object({
    accountslots: z.number().default(16),
    globalslots: z.number().default(5120),
    accountqueue: z.number().default(64),
    globalqueue: z.number().default(1024),
    lifetime: z.string().default('3h0m0s'),
  }).optional(),

  // Performance
  exitWhenSynced: z.boolean().default(false),
  datadirMinFreeDisk: z.number().default(4096), // MB
});

// Full Ethereum configuration combining base and chain-specific
export const EthConfigSchema = BaseChainConfigSchema.extend({
  nodeType: z.enum(['light', 'fast', 'full', 'archive', 'validator']).default('full'),
  config: EthNodeConfigSchema,

  // Validator-specific config (optional)
  validator: z.object({
    enabled: z.boolean().default(false),
    consensusClient: z.enum(['prysm', 'lighthouse', 'teku', 'nimbus', 'lodestar']).default('prysm'),
    feeRecipient: z.string().optional(),
    graffiti: z.string().optional(),
  }).optional(),
});

export type EthNodeConfig = z.infer<typeof EthNodeConfigSchema>;
export type EthConfig = z.infer<typeof EthConfigSchema>;
