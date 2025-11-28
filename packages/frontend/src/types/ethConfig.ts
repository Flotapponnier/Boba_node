// Frontend types for Ethereum configuration
// Mirrors backend types but simplified for form handling

export type EthNodeType = 'light' | 'full' | 'archive' | 'validator';
export type EthSyncMode = 'snap' | 'full' | 'light';
export type EthGcMode = 'full' | 'archive';
export type EthStateScheme = 'hash' | 'path';
export type ServiceType = 'ClusterIP' | 'NodePort' | 'LoadBalancer';
export type ConsensusClient = 'prysm' | 'lighthouse' | 'teku' | 'nimbus' | 'lodestar';

export interface EthConfig {
  // Basic info
  deploymentName: string;
  nodeName: string;
  nodeType: EthNodeType;
  namespace: string;

  // Image
  image: {
    repository: string;
    tag: string;
    pullPolicy: 'Always' | 'IfNotPresent' | 'Never';
  };

  // Service
  service: {
    type: ServiceType;
    ports: {
      http: { port: number; hostPort?: number };
      ws: { port: number; hostPort?: number };
      metrics: { port: number; hostPort?: number };
      p2p: { port: number; hostPort?: number };
    };
  };

  // Node configuration
  config: {
    syncMode: EthSyncMode;
    gcMode: EthGcMode;
    stateScheme: EthStateScheme;
    cache: number;
    cacheDatabase: number;
    cacheGc: number;
    cacheSnapshot: number;
    snapshot: boolean;
    historyState: number;
    historyTransactions: number;
    verbosity: number;
    httpApi: string;
    wsApi: string;
    httpVirtualHosts: string;
    httpCorsOrigins: string;
    authrpcEnabled: boolean;
    authrpcPort: number;
    authrpcVhosts: string;
    metricsEnabled: boolean;
    metricsInfluxdb: boolean;
    networkId: number;
    txpool: {
      accountslots: number;
      globalslots: number;
      accountqueue: number;
      globalqueue: number;
      lifetime: string;
    };
    exitWhenSynced: boolean;
    datadirMinFreeDisk: number;
  };

  // Networking
  networking?: {
    maxPeers: number;
    nodeDiscovery: boolean;
    bootnodes?: string;
    nat: string;
  };

  // Snapshot
  snapshot?: {
    enabled: boolean;
    url?: string;
    checksum?: string;
  };

  // Monitoring
  monitoring?: {
    enabled: boolean;
    prometheusOperator: boolean;
    grafanaDashboard: boolean;
    serviceMonitor?: {
      interval: string;
      scrapeTimeout: string;
    };
  };

  // Validator
  validator?: {
    enabled: boolean;
    consensusClient: ConsensusClient;
    feeRecipient?: string;
    graffiti?: string;
  };

  // Resources
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

  // Persistence
  persistence: {
    enabled: boolean;
    storageClass: string;
    size: string;
    hostPath?: string;
  };

  // Health probes
  livenessProbe: {
    enabled: boolean;
    initialDelaySeconds: number;
    periodSeconds: number;
    timeoutSeconds: number;
    failureThreshold: number;
  };

  readinessProbe: {
    enabled: boolean;
    initialDelaySeconds: number;
    periodSeconds: number;
    timeoutSeconds: number;
    failureThreshold: number;
  };
}

export const DEFAULT_ETH_CONFIG: EthConfig = {
  deploymentName: '',
  nodeName: 'eth-node',
  nodeType: 'full',
  namespace: 'default',

  image: {
    repository: 'ethereum/client-go',
    tag: 'v1.14.12',
    pullPolicy: 'IfNotPresent',
  },

  service: {
    type: 'ClusterIP',
    ports: {
      http: { port: 8545 },
      ws: { port: 8546 },
      metrics: { port: 6060 },
      p2p: { port: 30303 },
    },
  },

  config: {
    syncMode: 'snap',
    gcMode: 'full',
    stateScheme: 'path',
    cache: 16384,
    cacheDatabase: 50,
    cacheGc: 25,
    cacheSnapshot: 10,
    snapshot: true,
    historyState: 90000,
    historyTransactions: 2350000,
    verbosity: 3,
    httpApi: 'eth,net,web3',
    wsApi: 'eth,net,web3',
    httpVirtualHosts: '*',
    httpCorsOrigins: '*',
    authrpcEnabled: false,
    authrpcPort: 8551,
    authrpcVhosts: 'localhost',
    metricsEnabled: true,
    metricsInfluxdb: false,
    networkId: 1,
    txpool: {
      accountslots: 16,
      globalslots: 5120,
      accountqueue: 64,
      globalqueue: 1024,
      lifetime: '3h0m0s',
    },
    exitWhenSynced: false,
    datadirMinFreeDisk: 4096,
  },

  networking: {
    maxPeers: 50,
    nodeDiscovery: true,
    nat: 'any',
  },

  snapshot: {
    enabled: false,
  },

  monitoring: {
    enabled: false,
    prometheusOperator: true,
    grafanaDashboard: true,
  },

  validator: {
    enabled: false,
    consensusClient: 'prysm',
  },

  resources: {
    requests: {
      cpu: '16',
      memory: '64Gi',
    },
  },

  persistence: {
    enabled: true,
    storageClass: 'local-path',
    size: '2Ti',
  },

  livenessProbe: {
    enabled: true,
    initialDelaySeconds: 300,
    periodSeconds: 30,
    timeoutSeconds: 10,
    failureThreshold: 3,
  },

  readinessProbe: {
    enabled: true,
    initialDelaySeconds: 120,
    periodSeconds: 30,
    timeoutSeconds: 10,
    failureThreshold: 3,
  },
};
