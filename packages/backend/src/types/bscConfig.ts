import { z } from 'zod';

export const BscConfigSchema = z.object({
  // Basic info
  deploymentName: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Must be lowercase alphanumeric with hyphens'),
  nodeName: z.string().min(1),
  nodeType: z.enum(['fast', 'full', 'archive', 'validator']).default('fast'),
  namespace: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Must be lowercase alphanumeric with hyphens').default('default'),

  // Image
  image: z.object({
    repository: z.string().default('ghcr.io/bnb-chain/bsc'),
    tag: z.string().default('v1.4.17'),
    pullPolicy: z.enum(['Always', 'IfNotPresent', 'Never']).default('IfNotPresent'),
  }),

  // Service ports
  service: z.object({
    type: z.enum(['ClusterIP', 'NodePort', 'LoadBalancer']).default('ClusterIP'),
    ports: z.object({
      http: z.object({
        port: z.number().int().min(1).max(65535).default(8545),
        hostPort: z.number().int().min(1).max(65535).optional(),
      }),
      ws: z.object({
        port: z.number().int().min(1).max(65535).default(8546),
        hostPort: z.number().int().min(1).max(65535).optional(),
      }),
      metrics: z.object({
        port: z.number().int().min(1).max(65535).default(6060),
        hostPort: z.number().int().min(1).max(65535).optional(),
      }),
      p2p: z.object({
        port: z.number().int().min(1).max(65535).default(30311),
        hostPort: z.number().int().min(1).max(65535).optional(),
      }),
    }),
  }),

  // Node config
  config: z.object({
    cache: z.number().int().min(1024).default(16384),
    triesVerifyMode: z.enum(['local', 'full', 'insecure', 'none']).default('local'),
    historyTransactions: z.number().int().min(0).default(0),
    rpcAllowUnprotectedTxs: z.boolean().default(true),
    syncMode: z.enum(['snap', 'full', 'light']).default('snap'),
    gcMode: z.enum(['full', 'archive']).default('full'),
    ipcDisable: z.boolean().default(true),
    verbosity: z.number().int().min(0).max(5).default(3),
    httpApi: z.string().default('eth,net,web3,txpool,parlia'),
    wsApi: z.string().default('eth,net,web3'),
    httpVirtualHosts: z.string().default('*'),
    httpCorsOrigins: z.string().default('*'),
    txpool: z.object({
      globalslots: z.number().int().min(1).default(20000),
      globalqueue: z.number().int().min(1).default(10000),
      accountslots: z.number().int().min(1).default(16),
      accountqueue: z.number().int().min(1).default(64),
      lifetime: z.string().default('3h0m0s'),
    }),
  }),

  // Networking (Advanced)
  networking: z.object({
    maxPeers: z.number().int().min(1).max(200).default(50),
    bootnodes: z.string().optional(),
    nat: z.string().default('any'),
    nodeDiscovery: z.boolean().default(true),
  }).optional(),

  // Snapshot download
  snapshot: z.object({
    enabled: z.boolean().default(false),
    url: z.string().optional(),
    checksum: z.string().optional(),
  }).optional(),

  // Monitoring
  monitoring: z.object({
    enabled: z.boolean().default(false),
    prometheusOperator: z.boolean().default(true),
    grafanaDashboard: z.boolean().default(true),
    serviceMonitor: z.object({
      interval: z.string().default('30s'),
      scrapeTimeout: z.string().default('10s'),
    }).optional(),
  }).optional(),

  // Validator settings (only for validator nodes)
  validator: z.object({
    enabled: z.boolean().default(false),
    unlockAccount: z.string().optional(),
    password: z.string().optional(),
    extraData: z.string().optional(),
  }).optional(),

  // Resources
  resources: z.object({
    requests: z.object({
      cpu: z.string().default('8'),
      memory: z.string().default('64Gi'),
    }),
    limits: z.object({
      cpu: z.string().optional(),
      memory: z.string().optional(),
    }).optional(),
  }),

  // Persistence
  persistence: z.object({
    enabled: z.boolean().default(true),
    storageClass: z.string().default('local-path'),
    size: z.string().default('3Ti'),
    hostPath: z.string().optional(),
  }),

  // Health probes
  livenessProbe: z.object({
    enabled: z.boolean().default(true),
    initialDelaySeconds: z.number().int().min(0).default(300),
    periodSeconds: z.number().int().min(1).default(30),
    timeoutSeconds: z.number().int().min(1).default(10),
    failureThreshold: z.number().int().min(1).default(3),
  }),

  readinessProbe: z.object({
    enabled: z.boolean().default(true),
    initialDelaySeconds: z.number().int().min(0).default(120),
    periodSeconds: z.number().int().min(1).default(30),
    timeoutSeconds: z.number().int().min(1).default(10),
    failureThreshold: z.number().int().min(1).default(3),
  }),
});

export type BscConfig = z.infer<typeof BscConfigSchema>;
