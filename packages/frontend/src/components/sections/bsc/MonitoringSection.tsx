import SectionHeader from '../../SectionHeader';

interface MonitoringSectionProps {
  monitoring?: {
    enabled: boolean;
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
        tooltip="Integrates Prometheus metrics and Grafana dashboards for comprehensive node monitoring. Tracks sync progress, peer connections, block processing, resource usage, and chain health. Essential for production operations to detect issues proactively."
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
                  prometheusOperator: true,
                  grafanaDashboard: true,
                });
              } else {
                onChange('monitoring', { enabled: false });
              }
            }}
          />
          Enable Prometheus metrics and Grafana dashboard
        </label>
      </div>
      {monitoring?.enabled && (
        <div className="form-grid two-columns">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={monitoring.prometheusOperator}
                onChange={(e) => onChange('monitoring.prometheusOperator', e.target.checked)}
              />
              Include Prometheus ServiceMonitor
            </label>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={monitoring.grafanaDashboard}
                onChange={(e) => onChange('monitoring.grafanaDashboard', e.target.checked)}
              />
              Include Grafana Dashboard
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
