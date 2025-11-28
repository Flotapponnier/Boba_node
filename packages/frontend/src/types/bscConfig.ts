export interface BscConfig {
  deploymentName: string;
  nodeName: string;
  nodeType: 'fast' | 'full' | 'archive' | 'validator';
  image: {
    repository: string;
    tag: string;
    pullPolicy: 'Always' | 'IfNotPresent' | 'Never';
  };
  service: {
    type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
    ports: {
      http: { port: number; hostPort?: number };
      ws: { port: number; hostPort?: number };
      metrics: { port: number; hostPort?: number };
      p2p: { port: number; hostPort?: number };
    };
  };
  config: {
    cache: number;
    triesVerifyMode: 'local' | 'full' | 'insecure' | 'none';
    gcMode: 'full' | 'archive';
    historyTransactions: number;
    rpcAllowUnprotectedTxs: boolean;
    syncMode: 'snap' | 'full' | 'light';
    ipcDisable: boolean;
    verbosity: number;
    httpApi: string;
    wsApi: string;
    httpVirtualHosts: string;
    httpCorsOrigins: string;
    txpool: {
      globalslots: number;
      globalqueue: number;
      accountslots: number;
      accountqueue: number;
      lifetime: string;
    };
  };
  networking?: {
    maxPeers: number;
    bootnodes?: string;
    nat: string;
    nodeDiscovery: boolean;
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
    serviceMonitor?: {
      interval: string;
      scrapeTimeout: string;
    };
  };
  validator?: {
    enabled: boolean;
    unlockAccount?: string;
    password?: string;
    extraData?: string;
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
    hostPath?: string;
  };
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

export const NODE_TYPE_INFO = {
  fast: {
    name: 'Fast Node',
    description: 'High performance RPC node with minimal state verification. Best for serving requests.',
    recommended: {
      cpu: '16 cores',
      memory: '32GB RAM',
      storage: '2TB SSD'
    }
  },
  full: {
    name: 'Full Node',
    description: 'Complete node that stores recent state. Good balance between performance and data availability.',
    recommended: {
      cpu: '16 cores',
      memory: '64GB RAM',
      storage: '3TB SSD'
    }
  },
  archive: {
    name: 'Archive Node',
    description: 'Stores complete historical blockchain data. Required for historical queries.',
    recommended: {
      cpu: '16 cores',
      memory: '128GB RAM',
      storage: '10TB NVME SSD'
    }
  },
  validator: {
    name: 'Validator Node',
    description: 'Participates in block validation and consensus. Requires BNB stake.',
    recommended: {
      cpu: '16 cores',
      memory: '64GB RAM',
      storage: '3TB SSD'
    }
  }
};
