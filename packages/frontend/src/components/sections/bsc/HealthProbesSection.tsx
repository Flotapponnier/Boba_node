import SectionHeader from '../../SectionHeader';

interface HealthProbesSectionProps {
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
  onChange: (path: string, value: any) => void;
}

export default function HealthProbesSection({ livenessProbe, readinessProbe, onChange }: HealthProbesSectionProps) {
  return (
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
              checked={livenessProbe.enabled}
              onChange={(e) => onChange('livenessProbe.enabled', e.target.checked)}
            />
            Enable Liveness Probe
          </label>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={readinessProbe.enabled}
              onChange={(e) => onChange('readinessProbe.enabled', e.target.checked)}
            />
            Enable Readiness Probe
          </label>
        </div>
      </div>
    </div>
  );
}
