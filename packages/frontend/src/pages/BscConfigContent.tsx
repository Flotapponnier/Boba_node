import { useState, useEffect } from 'react';
import HelpTooltip from '../components/HelpTooltip';
import SectionHeader from '../components/SectionHeader';
import {
  getDocUrl,
  getNodeDescription,
  getCpuTooltip,
  getMemoryTooltip,
  getStorageTooltip,
  getChainDisplayName
} from '../utils/nodeTypeHelpers';
import '../styles/common.css';

interface BscConfig {
  deploymentName: string;
  nodeName: string;
  nodeType: 'fast' | 'full' | 'archive' | 'validator';
  namespace: string;
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
    gethExporter?: {
      enabled: boolean;
      image: {
        repository: string;
        tag: string;
        pullPolicy: 'Always' | 'IfNotPresent' | 'Never';
      };
      rpcUrl: string;
      port: number;
    };
    serviceMonitor?: {
      enabled: boolean;
      interval: string;
      scrapeTimeout: string;
      prometheusRelease: string;
    };
    alerts?: {
      enabled: boolean;
      slackWebhookUrl?: string;
      rules?: {
        diskSpaceCritical?: { enabled: boolean; threshold: number; forDuration: string };
        diskSpaceWarning?: { enabled: boolean; threshold: number; forDuration: string };
        highMemoryUsage?: { enabled: boolean; threshold: number; forDuration: string };
        txPoolOverload?: { enabled: boolean; threshold: number; forDuration: string };
        txPoolNearCapacity?: { enabled: boolean; threshold: number; forDuration: string };
        highCPUUsage?: { enabled: boolean; threshold: number; forDuration: string };
        highIOWait?: { enabled: boolean; threshold: number; forDuration: string };
        predictDiskFull?: { enabled: boolean; predictHours: number; forDuration: string };
      };
    };
    prometheusOperator: boolean;
    grafanaDashboard: boolean;
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

type BscNodeType = 'fast' | 'full' | 'archive' | 'validator';

interface BscConfigContentProps {
  nodeType: string;
}

export default function BscConfigContent({ nodeType }: BscConfigContentProps) {
  const [config, setConfig] = useState<BscConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generating, setGenerating] = useState(false);

  // Load default config and preset from backend
  useEffect(() => {
    fetch('/api/defaults/bsc')
      .then(res => res.json())
      .then(async (data) => {
        setConfig(data);

        // If nodeType is provided, load that preset
        if (nodeType) {
          try {
            const presetResponse = await fetch(`/api/presets/bsc/${nodeType}`);
            const preset = await presetResponse.json();

            setConfig(prev => prev ? ({
              ...prev,
              nodeType: nodeType as BscNodeType,
              deploymentName: `bsc-${nodeType}`,
              nodeName: `bsc-${nodeType}-node`,
              namespace: `bsc-${nodeType}`,
              config: { ...prev.config, ...preset.config },
              resources: preset.resources,
              persistence: { ...prev.persistence, size: preset.persistence.size },
            }) : prev);
          } catch (err) {
            console.error('Failed to load preset:', err);
          }
        }

        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load defaults:', err);
        setError('Failed to load configuration');
        setLoading(false);
      });
  }, [nodeType]);

  const handleChange = (path: string, value: any) => {
    if (!config) return;

    const keys = path.split('.');
    const newConfig = JSON.parse(JSON.stringify(config));
    let current: any = newConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
  };

  const handleGenerate = async () => {
    if (!config) return;

    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/generate/bsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to generate chart');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bsc-node-${config.deploymentName}.tgz`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Helm chart generated successfully!');
    } catch (error) {
      console.error('Failed to generate chart:', error);
      setError('Failed to generate chart. Please check your configuration.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="config-page-container">
        <div className="loading">Loading configuration...</div>
      </div>
    );
  }


  return (
    <div className="config-page-container">
      <div className="config-page-header">
        <h1>BSC {config.nodeType.charAt(0).toUpperCase() + config.nodeType.slice(1)} Node Configuration</h1>
        <p>{getNodeDescription('bsc', config.nodeType)}</p>
        <div className="doc-link-container">
          <a
            href={getDocUrl('bsc', config.nodeType)}
            target="_blank"
            rel="noopener noreferrer"
            className="doc-link"
          >
            Official BSC {config.nodeType === 'validator' ? 'Validator' : 'Node'} Documentation
          </a>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}>
        {/* Basic Configuration */}
        <div className="config-section">
          <SectionHeader
            title="Basic Configuration"
            tooltip="Essential identifiers for your BSC node deployment. These values determine how your node is named and organized in your Kubernetes cluster."
          />
          <div className="form-grid two-columns">
            <div className="form-group">
              <label>
                Deployment Name *
                <HelpTooltip content="Unique identifier for this deployment. Used in Helm chart naming and Kubernetes resources. Must be lowercase alphanumeric with hyphens only." />
              </label>
              <input
                type="text"
                value={config.deploymentName}
                onChange={(e) => handleChange('deploymentName', e.target.value)}
                placeholder="e.g., production, staging, dev"
                required
              />
            </div>
            <div className="form-group">
              <label>
                Node Name
                <HelpTooltip content="Human-readable name for your BSC node. This will be used in labels and service discovery." />
              </label>
              <input
                type="text"
                value={config.nodeName}
                onChange={(e) => handleChange('nodeName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                Kubernetes Namespace
                <HelpTooltip content="The Kubernetes namespace where the node will be deployed. Namespaces help organize resources in your cluster." />
              </label>
              <input
                type="text"
                value={config.namespace}
                onChange={(e) => handleChange('namespace', e.target.value)}
                placeholder="default"
              />
            </div>
          </div>
        </div>

        {/* Image Configuration */}
        <div className="config-section">
          <SectionHeader
            title="Container Image"
            tooltip="Docker container image settings for the BSC node. Uses the official BNB Chain image from GitHub Container Registry. Always verify the latest stable version before deploying to production."
          />
          <div className="form-grid three-columns">
            <div className="form-group">
              <label>
                Repository
                <HelpTooltip content="Docker image repository. Default: ghcr.io/bnb-chain/bsc for official BNB Chain images." />
              </label>
              <input
                type="text"
                value={config.image.repository}
                onChange={(e) => handleChange('image.repository', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                Tag
                <HelpTooltip content="Image version tag. Always verify the latest stable version from BNB Chain releases before deploying." />
              </label>
              <input
                type="text"
                value={config.image.tag}
                onChange={(e) => handleChange('image.tag', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                Pull Policy
                <HelpTooltip content="When to pull the image. IfNotPresent: Use cached image. Always: Pull on every restart. Never: Only use local image." />
              </label>
              <select
                value={config.image.pullPolicy}
                onChange={(e) => handleChange('image.pullPolicy', e.target.value)}
              >
                <option value="Always">Always</option>
                <option value="IfNotPresent">IfNotPresent</option>
                <option value="Never">Never</option>
              </select>
            </div>
          </div>
        </div>

        {/* Service Configuration */}
        <div className="config-section">
          <SectionHeader
            title="Service Configuration"
            tooltip="Kubernetes Service configuration for network access. Service type determines how your node is exposed: ClusterIP for internal-only access, NodePort for external access via specific node ports, or LoadBalancer for cloud-managed load balancing."
          />
          <div className="form-group">
            <label>
              Service Type
              <HelpTooltip content="ClusterIP: Internal access only. NodePort: External access via node IP and port. LoadBalancer: Cloud load balancer for production." />
            </label>
            <select
              value={config.service.type}
              onChange={(e) => handleChange('service.type', e.target.value)}
            >
              <option value="ClusterIP">ClusterIP</option>
              <option value="NodePort">NodePort</option>
              <option value="LoadBalancer">LoadBalancer</option>
            </select>
          </div>

          <h3>Ports</h3>
          <div className="form-grid four-columns">
            <div className="form-group">
              <label>
                HTTP Port
                <HelpTooltip content="HTTP JSON-RPC API port. Default: 8545. Used for eth_call, eth_sendTransaction, etc." />
              </label>
              <input
                type="number"
                value={config.service.ports.http.port}
                onChange={(e) => handleChange('service.ports.http.port', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                WebSocket Port
                <HelpTooltip content="WebSocket RPC port. Default: 8546. Enables real-time subscriptions for new blocks, logs, etc." />
              </label>
              <input
                type="number"
                value={config.service.ports.ws.port}
                onChange={(e) => handleChange('service.ports.ws.port', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                Metrics Port
                <HelpTooltip content="pprof debugging endpoint. Default: 6060. Exposes Go profiling data (CPU, memory, goroutines) at /debug/pprof/ for performance analysis and troubleshooting." />
              </label>
              <input
                type="number"
                value={config.service.ports.metrics.port}
                onChange={(e) => handleChange('service.ports.metrics.port', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                P2P Port
                <HelpTooltip content="Peer-to-peer network port. Default: 30303. Used for node discovery and blockchain synchronization." />
              </label>
              <input
                type="number"
                value={config.service.ports.p2p.port}
                onChange={(e) => handleChange('service.ports.p2p.port', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Node Configuration */}
        <div className="config-section">
          <SectionHeader
            title="Node Configuration"
            tooltip="Core BSC node parameters controlling sync behavior, caching, logging, and API exposure. These settings directly impact node performance, resource usage, and security. Snap sync mode is recommended for faster initial synchronization."
          />
          <div className="form-grid three-columns">
            <div className="form-group">
              <label>
                Cache Size (MB)
                <HelpTooltip content="Memory allocated for state caching. Higher values improve performance but require more RAM. Recommended: 10000-16384MB depending on available memory." />
              </label>
              <input
                type="number"
                value={config.config.cache}
                onChange={(e) => handleChange('config.cache', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                Sync Mode
                <HelpTooltip content="Snap: Fast sync with state snapshots (recommended). Full: Downloads entire blockchain. Light: Minimal storage, downloads headers only." />
              </label>
              <select
                value={config.config.syncMode}
                onChange={(e) => handleChange('config.syncMode', e.target.value)}
              >
                <option value="snap">Snap</option>
                <option value="full">Full</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                Verbosity (0-5)
                <HelpTooltip content="Logging level. 0: Silent, 1: Error, 2: Warn, 3: Info (recommended), 4: Debug, 5: Trace. Higher values produce more logs." />
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={config.config.verbosity}
                onChange={(e) => handleChange('config.verbosity', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-grid two-columns">
            <div className="form-group">
              <label>
                HTTP API
                <HelpTooltip content="Comma-separated list of RPC APIs available over HTTP. Common: eth, net, web3, txpool, parlia. More APIs = more attack surface." />
              </label>
              <input
                type="text"
                value={config.config.httpApi}
                onChange={(e) => handleChange('config.httpApi', e.target.value)}
                placeholder="eth,net,web3,txpool,parlia"
              />
            </div>
            <div className="form-group">
              <label>
                WebSocket API
                <HelpTooltip content="Comma-separated list of RPC APIs available over WebSocket. WebSocket enables real-time event subscriptions. Common: eth, net, web3." />
              </label>
              <input
                type="text"
                value={config.config.wsApi}
                onChange={(e) => handleChange('config.wsApi', e.target.value)}
                placeholder="eth,net,web3"
              />
            </div>
          </div>

          <h3>Transaction Pool</h3>
          <div className="form-grid two-columns">
            <div className="form-group">
              <label>
                Global Slots
                <HelpTooltip content="Maximum number of executable transaction slots for all accounts. Higher values allow more pending transactions but use more memory." />
              </label>
              <input
                type="number"
                value={config.config.txpool.globalslots}
                onChange={(e) => handleChange('config.txpool.globalslots', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                Global Queue
                <HelpTooltip content="Maximum number of non-executable transaction slots for all accounts. Queued transactions wait for nonce gaps to be filled." />
              </label>
              <input
                type="number"
                value={config.config.txpool.globalqueue}
                onChange={(e) => handleChange('config.txpool.globalqueue', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="config-section">
          <SectionHeader
            title="Resource Requirements"
            tooltip="Kubernetes resource requests defining the minimum CPU and memory allocated to your node. These values ensure your node has guaranteed resources. For production: Fast nodes need 8-16 cores and 32-64GB RAM, Archive nodes require 32+ cores and 128GB+ RAM."
          />
          <div className="form-grid two-columns">
            <div className="form-group">
              <label>
                CPU Requests
                <HelpTooltip content={getCpuTooltip('bsc', config.nodeType)} />
              </label>
              <input
                type="text"
                value={config.resources.requests.cpu}
                onChange={(e) => handleChange('resources.requests.cpu', e.target.value)}
                placeholder="e.g., 16, 16000m"
              />
            </div>
            <div className="form-group">
              <label>
                Memory Requests
                <HelpTooltip content={getMemoryTooltip('bsc', config.nodeType)} />
              </label>
              <input
                type="text"
                value={config.resources.requests.memory}
                onChange={(e) => handleChange('resources.requests.memory', e.target.value)}
                placeholder="e.g., 64Gi, 65536Mi"
              />
            </div>
          </div>
        </div>

        {/* Persistence */}
        <div className="config-section">
          <SectionHeader
            title="Storage Persistence"
            tooltip="Persistent storage configuration using PersistentVolumeClaims (PVC). Critical for production deployments - enables data survival across pod restarts. NVMe SSDs are strongly recommended for blockchain data due to high I/O requirements. BSC mainnet requires 3TB+ for full nodes, 10TB+ for archive nodes."
          />
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.persistence.enabled}
                onChange={(e) => handleChange('persistence.enabled', e.target.checked)}
              />
              <span>
                Enable Persistence (PVC)
                <HelpTooltip content="Creates a PersistentVolumeClaim to store blockchain data. Essential for production - without this, data is lost on pod restart." />
              </span>
            </label>
          </div>
          {config.persistence.enabled && (
            <div className="form-grid two-columns">
              <div className="form-group">
                <label>
                  Storage Class
                  <HelpTooltip content="Kubernetes StorageClass name for provisioning. Examples: local-path, gp3, premium-ssd. Must support the required disk size." />
                </label>
                <input
                  type="text"
                  value={config.persistence.storageClass}
                  onChange={(e) => handleChange('persistence.storageClass', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>
                  Size
                  <HelpTooltip content={getStorageTooltip('bsc', config.nodeType)} />
                </label>
                <input
                  type="text"
                  value={config.persistence.size}
                  onChange={(e) => handleChange('persistence.size', e.target.value)}
                  placeholder="e.g., 3Ti, 3072Gi"
                />
              </div>
            </div>
          )}
        </div>

        {/* Snapshot Download */}
        <div className="config-section">
          <SectionHeader
            title="Snapshot Download"
            tooltip="Enables downloading a pre-synced blockchain snapshot for faster initial synchronization. Highly recommended for new nodes to reduce sync time from days/weeks to hours. Snapshots are large files (1TB+) so ensure adequate bandwidth and storage."
          />
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.snapshot?.enabled || false}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleChange('snapshot', {
                      enabled: true,
                      url: 'https://tf-dex-prod-public-snapshot.s3-accelerate.amazonaws.com/geth-latest.tar.gz',
                    });
                  } else {
                    handleChange('snapshot', { enabled: false });
                  }
                }}
              />
              Enable snapshot download for faster initial sync
            </label>
          </div>
          {config.snapshot?.enabled && (
            <div className="form-group">
              <label>
                Snapshot URL
                <HelpTooltip content="URL to download blockchain snapshot. Official snapshots available from BNB Chain. Verify checksum before use." />
              </label>
              <input
                type="text"
                value={config.snapshot.url || ''}
                onChange={(e) => handleChange('snapshot.url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}
        </div>

        {/* Monitoring */}
        <div className="config-section">
          <SectionHeader
            title="Monitoring Stack"
            tooltip="Production-grade monitoring with Geth Exporter sidecar, Prometheus ServiceMonitor, and Grafana dashboards. Includes 15+ alerts for critical issues (node down, sync stalled), warnings (low peers, disk space), and performance metrics. Essential for production operations."
          />
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.monitoring?.enabled || false}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleChange('monitoring', {
                      enabled: true,
                      gethExporter: {
                        enabled: true,
                        image: {
                          repository: 'etclabscore/gethexporter',
                          tag: 'latest',
                          pullPolicy: 'IfNotPresent',
                        },
                        rpcUrl: 'http://localhost:8545',
                        port: 6061,
                      },
                      serviceMonitor: {
                        enabled: true,
                        interval: '10s',
                        scrapeTimeout: '10s',
                        prometheusRelease: 'kube-prometheus-stack',
                      },
                      alerts: {
                        enabled: true,
                      },
                      prometheusOperator: true,
                      grafanaDashboard: true,
                    });
                  } else {
                    handleChange('monitoring', { enabled: false });
                  }
                }}
              />
              <span>
                Enable Production Monitoring Stack
                <HelpTooltip content="Deploys complete monitoring solution: Geth Exporter sidecar (exposes blockchain metrics), Prometheus ServiceMonitor (scrapes metrics every 10s), PrometheusRule (15+ production alerts), and Grafana dashboard (14 panels). Monitors sync status, peer count, block processing, tx pool, CPU, memory, disk, and network." />
              </span>
            </label>
          </div>
          {config.monitoring?.enabled && (
            <>
              {/* Geth Exporter Configuration */}
              <h3>Geth Exporter Sidecar</h3>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.monitoring.gethExporter?.enabled || false}
                    onChange={(e) => {
                      const currentMonitoring = config.monitoring || { enabled: true, prometheusOperator: true, grafanaDashboard: true };
                      handleChange('monitoring.gethExporter', e.target.checked ? {
                        enabled: true,
                        image: {
                          repository: 'etclabscore/gethexporter',
                          tag: 'latest',
                          pullPolicy: 'IfNotPresent',
                        },
                        rpcUrl: 'http://localhost:8545',
                        port: 6061,
                      } : { enabled: false });
                    }}
                  />
                  <span>
                    Enable Geth Exporter
                    <HelpTooltip content="Deploys etclabscore/gethexporter sidecar container that queries the node's RPC endpoint and exposes blockchain-specific metrics (block number, peer count, tx pool size, gas usage) in Prometheus format on port 6061." />
                  </span>
                </label>
              </div>

              {config.monitoring.gethExporter?.enabled && (
                <div className="form-grid three-columns">
                  <div className="form-group">
                    <label>
                      Exporter Image Repository
                      <HelpTooltip content="Docker image for the Geth Exporter. Default: etclabscore/gethexporter (official community image)." />
                    </label>
                    <input
                      type="text"
                      value={config.monitoring.gethExporter.image.repository}
                      onChange={(e) => handleChange('monitoring.gethExporter.image.repository', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Exporter Image Tag
                      <HelpTooltip content="Image version. 'latest' is recommended for stable releases." />
                    </label>
                    <input
                      type="text"
                      value={config.monitoring.gethExporter.image.tag}
                      onChange={(e) => handleChange('monitoring.gethExporter.image.tag', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Exporter Port
                      <HelpTooltip content="Port where Geth Exporter exposes Prometheus metrics. Default: 6061. Prometheus will scrape this endpoint." />
                    </label>
                    <input
                      type="number"
                      value={config.monitoring.gethExporter.port}
                      onChange={(e) => handleChange('monitoring.gethExporter.port', Number(e.target.value))}
                    />
                  </div>
                </div>
              )}

              {/* ServiceMonitor Configuration */}
              <h3>Prometheus ServiceMonitor</h3>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.monitoring.serviceMonitor?.enabled || false}
                    onChange={(e) => {
                      handleChange('monitoring.serviceMonitor', e.target.checked ? {
                        enabled: true,
                        interval: '10s',
                        scrapeTimeout: '10s',
                        prometheusRelease: 'kube-prometheus-stack',
                      } : { enabled: false });
                    }}
                  />
                  <span>
                    Enable ServiceMonitor
                    <HelpTooltip content="Creates a Prometheus Operator ServiceMonitor resource that automatically configures Prometheus to scrape metrics from the Geth Exporter. Requires Prometheus Operator to be installed in the cluster." />
                  </span>
                </label>
              </div>

              {config.monitoring.serviceMonitor?.enabled && (
                <div className="form-grid three-columns">
                  <div className="form-group">
                    <label>
                      Scrape Interval
                      <HelpTooltip content="How often Prometheus scrapes metrics. Default: 10s. Lower values (5s) provide higher resolution but increase load. Higher values (30s) reduce load but lower resolution." />
                    </label>
                    <input
                      type="text"
                      value={config.monitoring.serviceMonitor.interval}
                      onChange={(e) => handleChange('monitoring.serviceMonitor.interval', e.target.value)}
                      placeholder="10s"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Scrape Timeout
                      <HelpTooltip content="Maximum time to wait for metrics response. Must be less than scrape interval. Default: 10s." />
                    </label>
                    <input
                      type="text"
                      value={config.monitoring.serviceMonitor.scrapeTimeout}
                      onChange={(e) => handleChange('monitoring.serviceMonitor.scrapeTimeout', e.target.value)}
                      placeholder="10s"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Prometheus Release Name
                      <HelpTooltip content="Helm release name of your Prometheus Operator installation. Must match for ServiceMonitor to be discovered. Default: kube-prometheus-stack." />
                    </label>
                    <input
                      type="text"
                      value={config.monitoring.serviceMonitor.prometheusRelease}
                      onChange={(e) => handleChange('monitoring.serviceMonitor.prometheusRelease', e.target.value)}
                      placeholder="kube-prometheus-stack"
                    />
                  </div>
                </div>
              )}

              {/* Alerts Configuration */}
              <h3>Prometheus Alerts</h3>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.monitoring.alerts?.enabled || false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleChange('monitoring.alerts', {
                          enabled: true,
                          slackWebhookUrl: '',
                          rules: {
                            diskSpaceCritical: { enabled: true, threshold: 10, forDuration: '5m' },
                            diskSpaceWarning: { enabled: true, threshold: 20, forDuration: '10m' },
                            highMemoryUsage: { enabled: true, threshold: 80, forDuration: '10m' },
                            txPoolOverload: { enabled: true, threshold: 5000, forDuration: '5m' },
                            txPoolNearCapacity: { enabled: true, threshold: 8000, forDuration: '2m' },
                            highCPUUsage: { enabled: true, threshold: 80, forDuration: '10m' },
                            highIOWait: { enabled: true, threshold: 20, forDuration: '10m' },
                            predictDiskFull: { enabled: true, predictHours: 4, forDuration: '5m' },
                          }
                        });
                      } else {
                        handleChange('monitoring.alerts', { enabled: false });
                      }
                    }}
                  />
                  <span>
                    Enable PrometheusRule Alerts
                    <HelpTooltip content="Deploys production-ready alerts with Slack notifications: CRITICAL (NodeDown, NotSyncing, DiskSpaceCritical), WARNING (DiskSpaceWarning, HighMemoryUsage, TxPoolOverload), PERFORMANCE (HighCPUUsage, HighIOWait, PredictDiskFull). Configure individual alerts and thresholds below." />
                  </span>
                </label>
              </div>

              {config.monitoring.alerts?.enabled && (
                <>
                  {/* Slack Webhook Configuration */}
                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label>
                      Slack Webhook URL (Optional)
                      <HelpTooltip content="Slack incoming webhook URL for alert notifications. Get yours from Slack App Settings > Incoming Webhooks. Format: https://hooks.slack.com/services/T.../B.../... Leave empty to skip Slack notifications." />
                    </label>
                    <input
                      type="text"
                      value={config.monitoring.alerts.slackWebhookUrl || ''}
                      onChange={(e) => handleChange('monitoring.alerts.slackWebhookUrl', e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>

                  {/* Alert Rules Configuration */}
                  <h4 style={{ marginTop: '25px', marginBottom: '15px', fontSize: '1.1rem', color: '#fff' }}>Individual Alert Rules</h4>

                  {/* Critical Alerts */}
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ color: '#ef4444', marginBottom: '10px', fontSize: '0.95rem' }}>🔴 Critical Alerts</h5>

                    {/* Disk Space Critical */}
                    <div className="form-group" style={{ paddingLeft: '15px', borderLeft: '3px solid #ef4444' }}>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={config.monitoring.alerts.rules?.diskSpaceCritical?.enabled || false}
                          onChange={(e) => handleChange('monitoring.alerts.rules.diskSpaceCritical', {
                            enabled: e.target.checked,
                            threshold: config.monitoring.alerts.rules?.diskSpaceCritical?.threshold || 10,
                            forDuration: config.monitoring.alerts.rules?.diskSpaceCritical?.forDuration || '5m'
                          })}
                        />
                        <span>Disk Space Critical - Very low disk space remaining
                          <HelpTooltip content="Critical alert when available disk space falls below threshold (default 10%). Requires immediate action - expand storage or prune data. Blockchain nodes can fill disks quickly during sync." />
                        </span>
                      </label>
                      {config.monitoring.alerts.rules?.diskSpaceCritical?.enabled && (
                        <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                          <label style={{ fontSize: '0.9rem' }}>
                            Threshold (%):
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={config.monitoring.alerts.rules.diskSpaceCritical.threshold}
                              onChange={(e) => handleChange('monitoring.alerts.rules.diskSpaceCritical.threshold', Number(e.target.value))}
                              style={{ marginLeft: '10px', width: '70px' }}
                            />
                          </label>
                          <label style={{ fontSize: '0.9rem' }}>
                            Duration:
                            <input
                              type="text"
                              value={config.monitoring.alerts.rules.diskSpaceCritical.forDuration}
                              onChange={(e) => handleChange('monitoring.alerts.rules.diskSpaceCritical.forDuration', e.target.value)}
                              placeholder="5m"
                              style={{ marginLeft: '10px', width: '80px' }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Warning Alerts */}
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ color: '#f59e0b', marginBottom: '10px', fontSize: '0.95rem' }}>🟡 Warning Alerts</h5>

                    {/* Disk Space Warning */}
                    <div className="form-group" style={{ paddingLeft: '15px', borderLeft: '3px solid #f59e0b' }}>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={config.monitoring.alerts.rules?.diskSpaceWarning?.enabled || false}
                          onChange={(e) => handleChange('monitoring.alerts.rules.diskSpaceWarning', {
                            enabled: e.target.checked,
                            threshold: config.monitoring.alerts.rules?.diskSpaceWarning?.threshold || 20,
                            forDuration: config.monitoring.alerts.rules?.diskSpaceWarning?.forDuration || '10m'
                          })}
                        />
                        <span>Disk Space Warning - Low disk space remaining
                          <HelpTooltip content="Warning alert when available disk space falls below threshold (default 20%). Time to plan storage expansion or data pruning. Gives advance notice before reaching critical levels." />
                        </span>
                      </label>
                      {config.monitoring.alerts.rules?.diskSpaceWarning?.enabled && (
                        <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                          <label style={{ fontSize: '0.9rem' }}>
                            Threshold (%):
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={config.monitoring.alerts.rules.diskSpaceWarning.threshold}
                              onChange={(e) => handleChange('monitoring.alerts.rules.diskSpaceWarning.threshold', Number(e.target.value))}
                              style={{ marginLeft: '10px', width: '70px' }}
                            />
                          </label>
                          <label style={{ fontSize: '0.9rem' }}>
                            Duration:
                            <input
                              type="text"
                              value={config.monitoring.alerts.rules.diskSpaceWarning.forDuration}
                              onChange={(e) => handleChange('monitoring.alerts.rules.diskSpaceWarning.forDuration', e.target.value)}
                              placeholder="10m"
                              style={{ marginLeft: '10px', width: '80px' }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* High Memory Usage */}
                    <div className="form-group" style={{ paddingLeft: '15px', borderLeft: '3px solid #f59e0b' }}>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={config.monitoring.alerts.rules?.highMemoryUsage?.enabled || false}
                          onChange={(e) => handleChange('monitoring.alerts.rules.highMemoryUsage', {
                            enabled: e.target.checked,
                            threshold: config.monitoring.alerts.rules?.highMemoryUsage?.threshold || 80,
                            forDuration: config.monitoring.alerts.rules?.highMemoryUsage?.forDuration || '10m'
                          })}
                        />
                        <span>High Memory Usage - Memory usage above threshold
                          <HelpTooltip content="Warning alert when system memory usage exceeds threshold (default 80%). Helps prevent OOM (Out Of Memory) kills. Monitor for sustained high usage - if persistent, consider increasing memory limits. Temporary spikes during sync are normal." />
                        </span>
                      </label>
                      {config.monitoring.alerts.rules?.highMemoryUsage?.enabled && (
                        <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                          <label style={{ fontSize: '0.9rem' }}>
                            Threshold (%):
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={config.monitoring.alerts.rules.highMemoryUsage.threshold}
                              onChange={(e) => handleChange('monitoring.alerts.rules.highMemoryUsage.threshold', Number(e.target.value))}
                              style={{ marginLeft: '10px', width: '70px' }}
                            />
                          </label>
                          <label style={{ fontSize: '0.9rem' }}>
                            Duration:
                            <input
                              type="text"
                              value={config.monitoring.alerts.rules.highMemoryUsage.forDuration}
                              onChange={(e) => handleChange('monitoring.alerts.rules.highMemoryUsage.forDuration', e.target.value)}
                              placeholder="10m"
                              style={{ marginLeft: '10px', width: '80px' }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* TX Pool Overload */}
                    <div className="form-group" style={{ paddingLeft: '15px', borderLeft: '3px solid #f59e0b' }}>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={config.monitoring.alerts.rules?.txPoolOverload?.enabled || false}
                          onChange={(e) => handleChange('monitoring.alerts.rules.txPoolOverload', {
                            enabled: e.target.checked,
                            threshold: config.monitoring.alerts.rules?.txPoolOverload?.threshold || 5000,
                            forDuration: config.monitoring.alerts.rules?.txPoolOverload?.forDuration || '5m'
                          })}
                        />
                        <span>TX Pool Overload - Too many pending transactions
                          <HelpTooltip content="Warning alert when pending transaction count exceeds threshold (default 5000). Normal during high network activity (NFT mints, airdrops, DeFi spikes). Monitor for degraded RPC performance. Consider increasing if persistent." />
                        </span>
                      </label>
                      {config.monitoring.alerts.rules?.txPoolOverload?.enabled && (
                        <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                          <label style={{ fontSize: '0.9rem' }}>
                            Threshold (count):
                            <input
                              type="number"
                              min="100"
                              max="50000"
                              value={config.monitoring.alerts.rules.txPoolOverload.threshold}
                              onChange={(e) => handleChange('monitoring.alerts.rules.txPoolOverload.threshold', Number(e.target.value))}
                              style={{ marginLeft: '10px', width: '90px' }}
                            />
                          </label>
                          <label style={{ fontSize: '0.9rem' }}>
                            Duration:
                            <input
                              type="text"
                              value={config.monitoring.alerts.rules.txPoolOverload.forDuration}
                              onChange={(e) => handleChange('monitoring.alerts.rules.txPoolOverload.forDuration', e.target.value)}
                              placeholder="5m"
                              style={{ marginLeft: '10px', width: '80px' }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* TX Pool Near Capacity */}
                    <div className="form-group" style={{ paddingLeft: '15px', borderLeft: '3px solid #f59e0b' }}>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={config.monitoring.alerts.rules?.txPoolNearCapacity?.enabled || false}
                          onChange={(e) => handleChange('monitoring.alerts.rules.txPoolNearCapacity', {
                            enabled: e.target.checked,
                            threshold: config.monitoring.alerts.rules?.txPoolNearCapacity?.threshold || 8000,
                            forDuration: config.monitoring.alerts.rules?.txPoolNearCapacity?.forDuration || '2m'
                          })}
                        />
                        <span>TX Pool Near Capacity - Critical tx pool threshold
                          <HelpTooltip content="Critical alert when pending transactions approach maximum capacity (default 8000, capacity is 10000). Warns before node starts dropping transactions. Consider increasing txpool.globalslots if this persists. Indicates extremely high network load." />
                        </span>
                      </label>
                      {config.monitoring.alerts.rules?.txPoolNearCapacity?.enabled && (
                        <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                          <label style={{ fontSize: '0.9rem' }}>
                            Threshold (count):
                            <input
                              type="number"
                              min="100"
                              max="50000"
                              value={config.monitoring.alerts.rules.txPoolNearCapacity.threshold}
                              onChange={(e) => handleChange('monitoring.alerts.rules.txPoolNearCapacity.threshold', Number(e.target.value))}
                              style={{ marginLeft: '10px', width: '90px' }}
                            />
                          </label>
                          <label style={{ fontSize: '0.9rem' }}>
                            Duration:
                            <input
                              type="text"
                              value={config.monitoring.alerts.rules.txPoolNearCapacity.forDuration}
                              onChange={(e) => handleChange('monitoring.alerts.rules.txPoolNearCapacity.forDuration', e.target.value)}
                              placeholder="2m"
                              style={{ marginLeft: '10px', width: '80px' }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Performance Alerts */}
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ color: '#3b82f6', marginBottom: '10px', fontSize: '0.95rem' }}>🔵 Performance Alerts</h5>

                    {/* High CPU Usage */}
                    <div className="form-group" style={{ paddingLeft: '15px', borderLeft: '3px solid #3b82f6' }}>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={config.monitoring.alerts.rules?.highCPUUsage?.enabled || false}
                          onChange={(e) => handleChange('monitoring.alerts.rules.highCPUUsage', {
                            enabled: e.target.checked,
                            threshold: config.monitoring.alerts.rules?.highCPUUsage?.threshold || 80,
                            forDuration: config.monitoring.alerts.rules?.highCPUUsage?.forDuration || '10m'
                          })}
                        />
                        <span>High CPU Usage - CPU usage above threshold
                          <HelpTooltip content="Performance alert when CPU usage exceeds threshold (default 80%). Normal during initial sync or when processing many blocks. If persistent when synced, investigate RPC load or stuck processes. May indicate need for more CPU cores." />
                        </span>
                      </label>
                      {config.monitoring.alerts.rules?.highCPUUsage?.enabled && (
                        <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                          <label style={{ fontSize: '0.9rem' }}>
                            Threshold (%):
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={config.monitoring.alerts.rules.highCPUUsage.threshold}
                              onChange={(e) => handleChange('monitoring.alerts.rules.highCPUUsage.threshold', Number(e.target.value))}
                              style={{ marginLeft: '10px', width: '70px' }}
                            />
                          </label>
                          <label style={{ fontSize: '0.9rem' }}>
                            Duration:
                            <input
                              type="text"
                              value={config.monitoring.alerts.rules.highCPUUsage.forDuration}
                              onChange={(e) => handleChange('monitoring.alerts.rules.highCPUUsage.forDuration', e.target.value)}
                              placeholder="10m"
                              style={{ marginLeft: '10px', width: '80px' }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* High IO Wait */}
                    <div className="form-group" style={{ paddingLeft: '15px', borderLeft: '3px solid #3b82f6' }}>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={config.monitoring.alerts.rules?.highIOWait?.enabled || false}
                          onChange={(e) => handleChange('monitoring.alerts.rules.highIOWait', {
                            enabled: e.target.checked,
                            threshold: config.monitoring.alerts.rules?.highIOWait?.threshold || 20,
                            forDuration: config.monitoring.alerts.rules?.highIOWait?.forDuration || '10m'
                          })}
                        />
                        <span>High IO Wait - System I/O constrained
                          <HelpTooltip content="Performance alert when I/O wait time exceeds threshold (default 20%). Indicates disk performance bottleneck. Check disk IOPS and throughput. Blockchain nodes require minimum 3000 IOPS, optimal 8000+ IOPS. Consider upgrading to faster NVMe SSD." />
                        </span>
                      </label>
                      {config.monitoring.alerts.rules?.highIOWait?.enabled && (
                        <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                          <label style={{ fontSize: '0.9rem' }}>
                            Threshold (%):
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={config.monitoring.alerts.rules.highIOWait.threshold}
                              onChange={(e) => handleChange('monitoring.alerts.rules.highIOWait.threshold', Number(e.target.value))}
                              style={{ marginLeft: '10px', width: '70px' }}
                            />
                          </label>
                          <label style={{ fontSize: '0.9rem' }}>
                            Duration:
                            <input
                              type="text"
                              value={config.monitoring.alerts.rules.highIOWait.forDuration}
                              onChange={(e) => handleChange('monitoring.alerts.rules.highIOWait.forDuration', e.target.value)}
                              placeholder="10m"
                              style={{ marginLeft: '10px', width: '80px' }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Predict Disk Full */}
                    <div className="form-group" style={{ paddingLeft: '15px', borderLeft: '3px solid #3b82f6' }}>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={config.monitoring.alerts.rules?.predictDiskFull?.enabled || false}
                          onChange={(e) => handleChange('monitoring.alerts.rules.predictDiskFull', {
                            enabled: e.target.checked,
                            predictHours: config.monitoring.alerts.rules?.predictDiskFull?.predictHours || 4,
                            forDuration: config.monitoring.alerts.rules?.predictDiskFull?.forDuration || '5m'
                          })}
                        />
                        <span>Predict Disk Full - Disk predicted to fill soon
                          <HelpTooltip content="Predictive alert using linear regression to forecast disk exhaustion (default predicts 4 hours ahead). Based on current fill rate over past hour. Requires immediate action - expand storage or prune data. More accurate during steady growth patterns." />
                        </span>
                      </label>
                      {config.monitoring.alerts.rules?.predictDiskFull?.enabled && (
                        <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                          <label style={{ fontSize: '0.9rem' }}>
                            Predict hours:
                            <input
                              type="number"
                              min="1"
                              max="48"
                              value={config.monitoring.alerts.rules.predictDiskFull.predictHours}
                              onChange={(e) => handleChange('monitoring.alerts.rules.predictDiskFull.predictHours', Number(e.target.value))}
                              style={{ marginLeft: '10px', width: '70px' }}
                            />
                          </label>
                          <label style={{ fontSize: '0.9rem' }}>
                            Duration:
                            <input
                              type="text"
                              value={config.monitoring.alerts.rules.predictDiskFull.forDuration}
                              onChange={(e) => handleChange('monitoring.alerts.rules.predictDiskFull.forDuration', e.target.value)}
                              placeholder="5m"
                              style={{ marginLeft: '10px', width: '80px' }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Dashboard Configuration */}
              <h3>Grafana Dashboard</h3>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.monitoring.grafanaDashboard}
                    onChange={(e) => handleChange('monitoring.grafanaDashboard', e.target.checked)}
                  />
                  <span>
                    Include Grafana Dashboard ConfigMap
                    <HelpTooltip content="Generates a pre-configured Grafana dashboard with 14 panels: Block Height, Node Status, Pending TX (stats); Block Number, TX/Block, Gas Usage, Block Size, TX Pool, Processing Time (blockchain metrics); CPU, Memory, Disk, Network (system metrics). Auto-imports if Grafana sidecar is enabled." />
                  </span>
                </label>
              </div>
            </>
          )}
        </div>

        {/* Health Probes */}
        <div className="config-section">
          <SectionHeader
            title="Health Probes"
            tooltip="Kubernetes health check configurations. Liveness probes restart unhealthy pods automatically. Readiness probes prevent traffic routing to pods that aren't ready. Essential for high availability and automatic recovery from failures."
          />
          <div className="form-grid two-columns">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.livenessProbe.enabled}
                  onChange={(e) => handleChange('livenessProbe.enabled', e.target.checked)}
                />
                Enable Liveness Probe
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.readinessProbe.enabled}
                  onChange={(e) => handleChange('readinessProbe.enabled', e.target.checked)}
                />
                Enable Readiness Probe
              </label>
            </div>
          </div>
        </div>

        <button type="submit" className="button-primary" disabled={generating}>
          {generating ? 'Generating...' : 'Generate Helm Chart'}
        </button>
      </form>
    </div>
  );
}
