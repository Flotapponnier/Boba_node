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
                  if (e.target.checked) {
                    onChange('monitoring.alerts', {
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
                    onChange('monitoring.alerts', { enabled: false });
                  }
                }}
              />
              <span>
                Enable PrometheusRule Alerts
                <HelpTooltip content="Deploys production-ready Arbitrum L2 alerts with Slack notifications: CRITICAL (NodeDown, SequencerFeedDisconnected, DiskSpaceCritical), WARNING (DiskSpaceWarning, HighMemoryUsage, TxPoolOverload), PERFORMANCE (HighCPUUsage, HighIOWait, PredictDiskFull). Configure individual alerts and thresholds below." />
              </span>
            </label>
          </div>

          {monitoring.alerts?.enabled && (
            <>
              {/* Slack Webhook Configuration */}
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>
                  Slack Webhook URL (Optional)
                  <HelpTooltip content="Slack incoming webhook URL for alert notifications. Get yours from Slack App Settings > Incoming Webhooks. Format: https://hooks.slack.com/services/T.../B.../... Leave empty to skip Slack notifications." />
                </label>
                <input
                  type="text"
                  value={monitoring.alerts.slackWebhookUrl || ''}
                  onChange={(e) => onChange('monitoring.alerts.slackWebhookUrl', e.target.value)}
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
                      checked={monitoring.alerts.rules?.diskSpaceCritical?.enabled || false}
                      onChange={(e) => onChange('monitoring.alerts.rules.diskSpaceCritical', {
                        enabled: e.target.checked,
                        threshold: monitoring.alerts.rules?.diskSpaceCritical?.threshold || 10,
                        forDuration: monitoring.alerts.rules?.diskSpaceCritical?.forDuration || '5m'
                      })}
                    />
                    <span>Disk Space Critical - Very low disk space remaining
                      <HelpTooltip content="Critical alert when available disk space falls below threshold (default 10%). Requires immediate action - expand storage or prune data. L2 nodes can fill disks quickly during sync." />
                    </span>
                  </label>
                  {monitoring.alerts.rules?.diskSpaceCritical?.enabled && (
                    <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                      <label style={{ fontSize: '0.9rem' }}>
                        Threshold (%):
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={monitoring.alerts.rules.diskSpaceCritical.threshold}
                          onChange={(e) => onChange('monitoring.alerts.rules.diskSpaceCritical.threshold', Number(e.target.value))}
                          style={{ marginLeft: '10px', width: '70px' }}
                        />
                      </label>
                      <label style={{ fontSize: '0.9rem' }}>
                        Duration:
                        <input
                          type="text"
                          value={monitoring.alerts.rules.diskSpaceCritical.forDuration}
                          onChange={(e) => onChange('monitoring.alerts.rules.diskSpaceCritical.forDuration', e.target.value)}
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
                      checked={monitoring.alerts.rules?.diskSpaceWarning?.enabled || false}
                      onChange={(e) => onChange('monitoring.alerts.rules.diskSpaceWarning', {
                        enabled: e.target.checked,
                        threshold: monitoring.alerts.rules?.diskSpaceWarning?.threshold || 20,
                        forDuration: monitoring.alerts.rules?.diskSpaceWarning?.forDuration || '10m'
                      })}
                    />
                    <span>Disk Space Warning - Low disk space remaining
                      <HelpTooltip content="Warning alert when available disk space falls below threshold (default 20%). Time to plan storage expansion or data pruning. Gives advance notice before reaching critical levels." />
                    </span>
                  </label>
                  {monitoring.alerts.rules?.diskSpaceWarning?.enabled && (
                    <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                      <label style={{ fontSize: '0.9rem' }}>
                        Threshold (%):
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={monitoring.alerts.rules.diskSpaceWarning.threshold}
                          onChange={(e) => onChange('monitoring.alerts.rules.diskSpaceWarning.threshold', Number(e.target.value))}
                          style={{ marginLeft: '10px', width: '70px' }}
                        />
                      </label>
                      <label style={{ fontSize: '0.9rem' }}>
                        Duration:
                        <input
                          type="text"
                          value={monitoring.alerts.rules.diskSpaceWarning.forDuration}
                          onChange={(e) => onChange('monitoring.alerts.rules.diskSpaceWarning.forDuration', e.target.value)}
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
                      checked={monitoring.alerts.rules?.highMemoryUsage?.enabled || false}
                      onChange={(e) => onChange('monitoring.alerts.rules.highMemoryUsage', {
                        enabled: e.target.checked,
                        threshold: monitoring.alerts.rules?.highMemoryUsage?.threshold || 80,
                        forDuration: monitoring.alerts.rules?.highMemoryUsage?.forDuration || '10m'
                      })}
                    />
                    <span>High Memory Usage - Memory usage above threshold
                      <HelpTooltip content="Warning alert when system memory usage exceeds threshold (default 80%). Helps prevent OOM (Out Of Memory) kills. Monitor for sustained high usage - if persistent, consider increasing memory limits. Temporary spikes during L2 sync are normal." />
                    </span>
                  </label>
                  {monitoring.alerts.rules?.highMemoryUsage?.enabled && (
                    <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                      <label style={{ fontSize: '0.9rem' }}>
                        Threshold (%):
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={monitoring.alerts.rules.highMemoryUsage.threshold}
                          onChange={(e) => onChange('monitoring.alerts.rules.highMemoryUsage.threshold', Number(e.target.value))}
                          style={{ marginLeft: '10px', width: '70px' }}
                        />
                      </label>
                      <label style={{ fontSize: '0.9rem' }}>
                        Duration:
                        <input
                          type="text"
                          value={monitoring.alerts.rules.highMemoryUsage.forDuration}
                          onChange={(e) => onChange('monitoring.alerts.rules.highMemoryUsage.forDuration', e.target.value)}
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
                      checked={monitoring.alerts.rules?.txPoolOverload?.enabled || false}
                      onChange={(e) => onChange('monitoring.alerts.rules.txPoolOverload', {
                        enabled: e.target.checked,
                        threshold: monitoring.alerts.rules?.txPoolOverload?.threshold || 5000,
                        forDuration: monitoring.alerts.rules?.txPoolOverload?.forDuration || '5m'
                      })}
                    />
                    <span>TX Pool Overload - Too many pending transactions
                      <HelpTooltip content="Warning alert when pending transaction count exceeds threshold (default 5000). Normal during high L2 network activity. Monitor for degraded RPC performance. Consider increasing if persistent." />
                    </span>
                  </label>
                  {monitoring.alerts.rules?.txPoolOverload?.enabled && (
                    <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                      <label style={{ fontSize: '0.9rem' }}>
                        Threshold (count):
                        <input
                          type="number"
                          min="100"
                          max="50000"
                          value={monitoring.alerts.rules.txPoolOverload.threshold}
                          onChange={(e) => onChange('monitoring.alerts.rules.txPoolOverload.threshold', Number(e.target.value))}
                          style={{ marginLeft: '10px', width: '90px' }}
                        />
                      </label>
                      <label style={{ fontSize: '0.9rem' }}>
                        Duration:
                        <input
                          type="text"
                          value={monitoring.alerts.rules.txPoolOverload.forDuration}
                          onChange={(e) => onChange('monitoring.alerts.rules.txPoolOverload.forDuration', e.target.value)}
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
                      checked={monitoring.alerts.rules?.txPoolNearCapacity?.enabled || false}
                      onChange={(e) => onChange('monitoring.alerts.rules.txPoolNearCapacity', {
                        enabled: e.target.checked,
                        threshold: monitoring.alerts.rules?.txPoolNearCapacity?.threshold || 8000,
                        forDuration: monitoring.alerts.rules?.txPoolNearCapacity?.forDuration || '2m'
                      })}
                    />
                    <span>TX Pool Near Capacity - Critical tx pool threshold
                      <HelpTooltip content="Critical alert when pending transactions approach maximum capacity (default 8000, capacity is 10000). Warns before node starts dropping transactions. Consider increasing txpool settings if this persists. Indicates extremely high L2 network load." />
                    </span>
                  </label>
                  {monitoring.alerts.rules?.txPoolNearCapacity?.enabled && (
                    <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                      <label style={{ fontSize: '0.9rem' }}>
                        Threshold (count):
                        <input
                          type="number"
                          min="100"
                          max="50000"
                          value={monitoring.alerts.rules.txPoolNearCapacity.threshold}
                          onChange={(e) => onChange('monitoring.alerts.rules.txPoolNearCapacity.threshold', Number(e.target.value))}
                          style={{ marginLeft: '10px', width: '90px' }}
                        />
                      </label>
                      <label style={{ fontSize: '0.9rem' }}>
                        Duration:
                        <input
                          type="text"
                          value={monitoring.alerts.rules.txPoolNearCapacity.forDuration}
                          onChange={(e) => onChange('monitoring.alerts.rules.txPoolNearCapacity.forDuration', e.target.value)}
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
                      checked={monitoring.alerts.rules?.highCPUUsage?.enabled || false}
                      onChange={(e) => onChange('monitoring.alerts.rules.highCPUUsage', {
                        enabled: e.target.checked,
                        threshold: monitoring.alerts.rules?.highCPUUsage?.threshold || 80,
                        forDuration: monitoring.alerts.rules?.highCPUUsage?.forDuration || '10m'
                      })}
                    />
                    <span>High CPU Usage - CPU usage above threshold
                      <HelpTooltip content="Performance alert when CPU usage exceeds threshold (default 80%). Normal during initial L2 sync or high RPC load. If persistent when synced, investigate. Arbitrum Nitro benefits from strong single-core performance." />
                    </span>
                  </label>
                  {monitoring.alerts.rules?.highCPUUsage?.enabled && (
                    <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                      <label style={{ fontSize: '0.9rem' }}>
                        Threshold (%):
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={monitoring.alerts.rules.highCPUUsage.threshold}
                          onChange={(e) => onChange('monitoring.alerts.rules.highCPUUsage.threshold', Number(e.target.value))}
                          style={{ marginLeft: '10px', width: '70px' }}
                        />
                      </label>
                      <label style={{ fontSize: '0.9rem' }}>
                        Duration:
                        <input
                          type="text"
                          value={monitoring.alerts.rules.highCPUUsage.forDuration}
                          onChange={(e) => onChange('monitoring.alerts.rules.highCPUUsage.forDuration', e.target.value)}
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
                      checked={monitoring.alerts.rules?.highIOWait?.enabled || false}
                      onChange={(e) => onChange('monitoring.alerts.rules.highIOWait', {
                        enabled: e.target.checked,
                        threshold: monitoring.alerts.rules?.highIOWait?.threshold || 20,
                        forDuration: monitoring.alerts.rules?.highIOWait?.forDuration || '10m'
                      })}
                    />
                    <span>High IO Wait - System I/O constrained
                      <HelpTooltip content="Performance alert when I/O wait time exceeds threshold (default 20%). Indicates disk performance bottleneck. Check disk IOPS and throughput. L2 nodes require minimum 3000 IOPS, optimal 8000+ IOPS. Consider upgrading to faster NVMe SSD." />
                    </span>
                  </label>
                  {monitoring.alerts.rules?.highIOWait?.enabled && (
                    <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                      <label style={{ fontSize: '0.9rem' }}>
                        Threshold (%):
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={monitoring.alerts.rules.highIOWait.threshold}
                          onChange={(e) => onChange('monitoring.alerts.rules.highIOWait.threshold', Number(e.target.value))}
                          style={{ marginLeft: '10px', width: '70px' }}
                        />
                      </label>
                      <label style={{ fontSize: '0.9rem' }}>
                        Duration:
                        <input
                          type="text"
                          value={monitoring.alerts.rules.highIOWait.forDuration}
                          onChange={(e) => onChange('monitoring.alerts.rules.highIOWait.forDuration', e.target.value)}
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
                      checked={monitoring.alerts.rules?.predictDiskFull?.enabled || false}
                      onChange={(e) => onChange('monitoring.alerts.rules.predictDiskFull', {
                        enabled: e.target.checked,
                        predictHours: monitoring.alerts.rules?.predictDiskFull?.predictHours || 4,
                        forDuration: monitoring.alerts.rules?.predictDiskFull?.forDuration || '5m'
                      })}
                    />
                    <span>Predict Disk Full - Disk predicted to fill soon
                      <HelpTooltip content="Predictive alert using linear regression to forecast disk exhaustion (default predicts 4 hours ahead). Based on current fill rate over past hour. Requires immediate action - expand storage or prune data. More accurate during steady growth patterns." />
                    </span>
                  </label>
                  {monitoring.alerts.rules?.predictDiskFull?.enabled && (
                    <div style={{ marginLeft: '30px', marginTop: '8px', display: 'flex', gap: '15px' }}>
                      <label style={{ fontSize: '0.9rem' }}>
                        Predict hours:
                        <input
                          type="number"
                          min="1"
                          max="48"
                          value={monitoring.alerts.rules.predictDiskFull.predictHours}
                          onChange={(e) => onChange('monitoring.alerts.rules.predictDiskFull.predictHours', Number(e.target.value))}
                          style={{ marginLeft: '10px', width: '70px' }}
                        />
                      </label>
                      <label style={{ fontSize: '0.9rem' }}>
                        Duration:
                        <input
                          type="text"
                          value={monitoring.alerts.rules.predictDiskFull.forDuration}
                          onChange={(e) => onChange('monitoring.alerts.rules.predictDiskFull.forDuration', e.target.value)}
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
