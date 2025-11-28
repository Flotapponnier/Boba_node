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
