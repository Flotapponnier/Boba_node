import { z } from 'zod';

// Common node types across blockchains
export type NodeType = 'light' | 'fast' | 'full' | 'archive' | 'validator';

// Common service configuration
export const ServiceConfigSchema = z.object({
  type: z.enum(['ClusterIP', 'NodePort', 'LoadBalancer']).default('ClusterIP'),
  ports: z.object({
    http: z.object({
      port: z.number().min(1).max(65535),
      hostPort: z.number().min(1).max(65535).optional(),
    }),
    ws: z.object({
      port: z.number().min(1).max(65535),
      hostPort: z.number().min(1).max(65535).optional(),
    }),
    metrics: z.object({
      port: z.number().min(1).max(65535),
      hostPort: z.number().min(1).max(65535).optional(),
    }),
    p2p: z.object({
      port: z.number().min(1).max(65535),
      hostPort: z.number().min(1).max(65535).optional(),
    }),
  }),
});

// Common image configuration
export const ImageConfigSchema = z.object({
  repository: z.string().min(1),
  tag: z.string().min(1),
  pullPolicy: z.enum(['Always', 'IfNotPresent', 'Never']).default('IfNotPresent'),
});

// Common resources configuration
export const ResourcesSchema = z.object({
  requests: z.object({
    cpu: z.string(),
    memory: z.string(),
  }),
  limits: z.object({
    cpu: z.string(),
    memory: z.string(),
  }).optional(),
});

// Common persistence configuration
export const PersistenceSchema = z.object({
  enabled: z.boolean().default(true),
  storageClass: z.string().default('local-path'),
  size: z.string(),
  hostPath: z.string().optional(),
});

// Common probe configuration
export const ProbeSchema = z.object({
  enabled: z.boolean().default(true),
  initialDelaySeconds: z.number().min(0).default(60),
  periodSeconds: z.number().min(1).default(30),
  timeoutSeconds: z.number().min(1).default(10),
  failureThreshold: z.number().min(1).default(3),
});

// Common snapshot configuration
export const SnapshotSchema = z.object({
  enabled: z.boolean().default(false),
  url: z.string().url().optional(),
  checksum: z.string().optional(),
});

// Alert rule schema
export const AlertRuleSchema = z.object({
  enabled: z.boolean(),
  threshold: z.number().optional(),
  predictHours: z.number().optional(),
  forDuration: z.string(),
});

// Common monitoring configuration
export const MonitoringSchema = z.object({
  enabled: z.boolean().default(false),
  gethExporter: z.object({
    enabled: z.boolean().default(true),
    image: z.object({
      repository: z.string().default('etclabscore/gethexporter'),
      tag: z.string().default('latest'),
      pullPolicy: z.enum(['Always', 'IfNotPresent', 'Never']).default('IfNotPresent'),
    }),
    rpcUrl: z.string().default('http://localhost:8545'),
    port: z.number().int().min(1).max(65535).default(6061),
  }).optional(),
  serviceMonitor: z.object({
    enabled: z.boolean().default(true),
    interval: z.string().default('10s'),
    scrapeTimeout: z.string().default('10s'),
    prometheusRelease: z.string().default('kube-prometheus-stack'),
  }).optional(),
  alerts: z.object({
    enabled: z.boolean().default(true),
    slackWebhookUrl: z.string().optional(),
    rules: z.object({
      nodeDown: AlertRuleSchema.optional(),
      diskSpaceCritical: AlertRuleSchema.optional(),
      diskSpaceWarning: AlertRuleSchema.optional(),
      highMemoryUsage: AlertRuleSchema.optional(),
      txPoolOverload: AlertRuleSchema.optional(),
      txPoolNearCapacity: AlertRuleSchema.optional(),
      highCPUUsage: AlertRuleSchema.optional(),
      highIOWait: AlertRuleSchema.optional(),
      predictDiskFull: AlertRuleSchema.optional(),
    }).optional(),
  }).optional(),
  prometheusOperator: z.boolean().default(true),
  grafanaDashboard: z.boolean().default(true),
});

// Common networking configuration
export const NetworkingSchema = z.object({
  maxPeers: z.number().min(0).default(50),
  nodeDiscovery: z.boolean().default(true),
  bootnodes: z.string().optional(),
  nat: z.enum(['any', 'none', 'upnp', 'pmp', 'extip']).default('any'),
});

// Base configuration schema for all blockchains
export const BaseChainConfigSchema = z.object({
  deploymentName: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Must be lowercase alphanumeric with hyphens'),
  nodeName: z.string().min(1),
  namespace: z.string().min(1).regex(/^[a-z0-9-]+$/).default('default'),
  image: ImageConfigSchema,
  service: ServiceConfigSchema,
  resources: ResourcesSchema,
  persistence: PersistenceSchema,
  livenessProbe: ProbeSchema,
  readinessProbe: ProbeSchema,
  snapshot: SnapshotSchema.optional(),
  monitoring: MonitoringSchema.optional(),
  networking: NetworkingSchema.optional(),
});

export type ServiceConfig = z.infer<typeof ServiceConfigSchema>;
export type ImageConfig = z.infer<typeof ImageConfigSchema>;
export type Resources = z.infer<typeof ResourcesSchema>;
export type Persistence = z.infer<typeof PersistenceSchema>;
export type Probe = z.infer<typeof ProbeSchema>;
export type Snapshot = z.infer<typeof SnapshotSchema>;
export type AlertRule = z.infer<typeof AlertRuleSchema>;
export type Monitoring = z.infer<typeof MonitoringSchema>;
export type Networking = z.infer<typeof NetworkingSchema>;
export type BaseChainConfig = z.infer<typeof BaseChainConfigSchema>;
