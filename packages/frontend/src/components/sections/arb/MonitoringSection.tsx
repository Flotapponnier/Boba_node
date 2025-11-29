import SectionHeader from '../../SectionHeader';
import HelpTooltip from '../../HelpTooltip';

interface MonitoringSectionProps {
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
    };
    prometheusOperator: boolean;
    grafanaDashboard: boolean;
  };
  onChange: (path: string, value: any) => void;
}

export default function MonitoringSection({ monitoring, onChange }: MonitoringSectionProps) {
  return (
    <div className="config-section">
      <SectionHeader
        title="Monitoring Stack"
        tooltip="Production-grade monitoring for Arbitrum L2 node with Geth Exporter sidecar, Prometheus ServiceMonitor, and Grafana dashboards. Includes 15+ alerts for critical issues (node down, sync stalled), warnings (low peers, sequencer feed disconnection), and performance metrics. Essential for L2 production operations."
      />
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={monitoring?.enabled || false}
            onChange={(e) => {
              if (e.target.checked) {
                onChange('monitoring', {
                  enabled: true,
                  gethExporter: {
                    enabled: true,
                    image: {
                      repository: 'etclabscore/gethexporter',
                      tag: 'latest',
                      pullPolicy: 'IfNotPresent',
                    },
                    rpcUrl: 'http://localhost:8547',
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
                onChange('monitoring', { enabled: false });
              }
            }}
          />
          <span>
            Enable Production Monitoring Stack
            <HelpTooltip content="Deploys complete L2 monitoring solution: Geth Exporter sidecar (exposes Arbitrum blockchain metrics), Prometheus ServiceMonitor (scrapes metrics every 10s), PrometheusRule (15+ production alerts), and Grafana dashboard (14 panels). Monitors L2 sync status, sequencer feed, batch posting, parent chain connectivity, tx pool, CPU, memory, disk, and network." />
          </span>
        </label>
      </div>
      {monitoring?.enabled && (
        <>
          {/* Geth Exporter Configuration */}
          <h3>Geth Exporter Sidecar</h3>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={monitoring.gethExporter?.enabled || false}
                onChange={(e) => {
                  onChange('monitoring.gethExporter', e.target.checked ? {
                    enabled: true,
                    image: {
                      repository: 'etclabscore/gethexporter',
                      tag: 'latest',
                      pullPolicy: 'IfNotPresent',
                    },
                    rpcUrl: 'http://localhost:8547',
                    port: 6061,
                  } : { enabled: false });
                }}
              />
              <span>
                Enable Geth Exporter
                <HelpTooltip content="Deploys etclabscore/gethexporter sidecar container that queries the Arbitrum node's RPC endpoint and exposes blockchain-specific metrics (block number, peer count, tx pool size, gas usage, sequencer feed status) in Prometheus format on port 6061." />
              </span>
            </label>
          </div>

          {monitoring.gethExporter?.enabled && (
            <div className="form-grid three-columns">
              <div className="form-group">
                <label>
                  Exporter Image Repository
                  <HelpTooltip content="Docker image for the Geth Exporter. Default: etclabscore/gethexporter (official community image, compatible with Arbitrum Nitro)." />
                </label>
                <input
                  type="text"
                  value={monitoring.gethExporter.image.repository}
                  onChange={(e) => onChange('monitoring.gethExporter.image.repository', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>
                  Exporter Image Tag
                  <HelpTooltip content="Image version. 'latest' is recommended for stable releases." />
                </label>
                <input
                  type="text"
                  value={monitoring.gethExporter.image.tag}
                  onChange={(e) => onChange('monitoring.gethExporter.image.tag', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>
                  Exporter Port
                  <HelpTooltip content="Port where Geth Exporter exposes Prometheus metrics. Default: 6061. Prometheus will scrape this endpoint." />
                </label>
                <input
                  type="number"
                  value={monitoring.gethExporter.port}
                  onChange={(e) => onChange('monitoring.gethExporter.port', Number(e.target.value))}
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
                checked={monitoring.serviceMonitor?.enabled || false}
                onChange={(e) => {
                  onChange('monitoring.serviceMonitor', e.target.checked ? {
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

          {monitoring.serviceMonitor?.enabled && (
            <div className="form-grid three-columns">
              <div className="form-group">
                <label>
                  Scrape Interval
                  <HelpTooltip content="How often Prometheus scrapes metrics. Default: 10s. Lower values (5s) provide higher resolution for L2 batch monitoring but increase load. Higher values (30s) reduce load but lower resolution." />
                </label>
                <input
                  type="text"
                  value={monitoring.serviceMonitor.interval}
                  onChange={(e) => onChange('monitoring.serviceMonitor.interval', e.target.value)}
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
                  value={monitoring.serviceMonitor.scrapeTimeout}
                  onChange={(e) => onChange('monitoring.serviceMonitor.scrapeTimeout', e.target.value)}
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
                  value={monitoring.serviceMonitor.prometheusRelease}
                  onChange={(e) => onChange('monitoring.serviceMonitor.prometheusRelease', e.target.value)}
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
                checked={monitoring.alerts?.enabled || false}
                onChange={(e) => {
                  onChange('monitoring.alerts', { enabled: e.target.checked });
                }}
              />
              <span>
                Enable PrometheusRule Alerts
                <HelpTooltip content="Deploys 15+ production-ready Arbitrum L2 alerts: CRITICAL (NodeDown, NoPeers, SyncStalled, SequencerFeedDisconnected, DiskSpaceCritical), WARNING (LowPeerCount, SyncLag, HighMemoryUsage, TxPoolOverload), PERFORMANCE (HighCPUUsage, HighIOWait, PredictDiskFull). Alerts integrate with Alertmanager for notifications." />
              </span>
            </label>
          </div>

          {/* Dashboard Configuration */}
          <h3>Grafana Dashboard</h3>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={monitoring.grafanaDashboard}
                onChange={(e) => onChange('monitoring.grafanaDashboard', e.target.checked)}
              />
              <span>
                Include Grafana Dashboard ConfigMap
                <HelpTooltip content="Generates a pre-configured Grafana dashboard with 14 panels optimized for Arbitrum L2: Block Height, Node Status, Pending TX (stats); L2 Block Number, TX/Block, Gas Usage, Batch Size, TX Pool, Processing Time (L2 blockchain metrics); CPU, Memory, Disk, Network (system metrics). Auto-imports if Grafana sidecar is enabled." />
              </span>
            </label>
          </div>
        </>
      )}
    </div>
  );
}
