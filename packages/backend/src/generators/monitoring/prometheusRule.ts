/**
 * PrometheusRule Generator
 * Creates configurable Prometheus alerts based on user selection
 */

export function generatePrometheusRuleYaml(chain: string, chainName: string): string {
  const chainUpper = chain.toUpperCase();

  return `{{- if and .Values.monitoring.enabled .Values.monitoring.alerts.enabled }}
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: {{ .Values.nodeName }}-alerts
  namespace: {{ .Values.namespace | default "default" }}
  labels:
    app: {{ .Values.nodeName }}
    chain: ${chain}
    release: {{ .Values.monitoring.serviceMonitor.prometheusRelease }}
spec:
  groups:
  # Critical Alerts - Immediate Action Required
  - name: ${chain}-node-critical
    interval: 30s
    rules:
    {{- if .Values.monitoring.alerts.rules.diskSpaceCritical.enabled }}
    - alert: ${chainUpper}NodeDiskSpaceCritical
      expr: |
        (node_filesystem_avail_bytes{mountpoint="/"} * 100)
        / node_filesystem_size_bytes{mountpoint="/"} < {{ .Values.monitoring.alerts.rules.diskSpaceCritical.threshold }}
      for: {{ .Values.monitoring.alerts.rules.diskSpaceCritical.forDuration }}
      labels:
        severity: critical
        chain: ${chain}
      annotations:
        summary: "${chainName} node disk space critically low"
        description: "Less than {{ .Values.monitoring.alerts.rules.diskSpaceCritical.threshold }}% disk space remaining on {{ printf "{{" }} $labels.instance {{ "}}" }}"
        runbook: "Expand storage or prune blockchain data immediately"
    {{- end }}

  # Warning Alerts - Investigation Required
  - name: ${chain}-node-warning
    interval: 30s
    rules:
    {{- if .Values.monitoring.alerts.rules.diskSpaceWarning.enabled }}
    - alert: ${chainUpper}NodeDiskSpaceWarning
      expr: |
        (node_filesystem_avail_bytes{mountpoint="/"} * 100)
        / node_filesystem_size_bytes{mountpoint="/"} < {{ .Values.monitoring.alerts.rules.diskSpaceWarning.threshold }}
      for: {{ .Values.monitoring.alerts.rules.diskSpaceWarning.forDuration }}
      labels:
        severity: warning
        chain: ${chain}
      annotations:
        summary: "${chainName} node disk space low"
        description: "Less than {{ .Values.monitoring.alerts.rules.diskSpaceWarning.threshold }}% disk space remaining on {{ printf "{{" }} $labels.instance {{ "}}" }}"
        runbook: "Plan storage expansion or data pruning"
    {{- end }}

    {{- if .Values.monitoring.alerts.rules.highMemoryUsage.enabled }}
    - alert: ${chainUpper}NodeHighMemoryUsage
      expr: |
        (1 - (node_memory_MemFree_bytes / node_memory_MemTotal_bytes)) * 100 > {{ .Values.monitoring.alerts.rules.highMemoryUsage.threshold }}
      for: {{ .Values.monitoring.alerts.rules.highMemoryUsage.forDuration }}
      labels:
        severity: warning
        chain: ${chain}
      annotations:
        summary: "${chainName} node high memory usage"
        description: "Memory usage at {{ printf "{{" }} $value {{ "}}" }}% on {{ printf "{{" }} $labels.instance {{ "}}" }}"
        runbook: "Monitor for OOM kills. Consider increasing memory limits if persistent."
    {{- end }}

    {{- if .Values.monitoring.alerts.rules.txPoolOverload.enabled }}
    - alert: ${chainUpper}NodeTxPoolOverload
      expr: geth_txpool_pending_count > {{ .Values.monitoring.alerts.rules.txPoolOverload.threshold }}
      for: {{ .Values.monitoring.alerts.rules.txPoolOverload.forDuration }}
      labels:
        severity: warning
        chain: ${chain}
      annotations:
        summary: "${chainName} node transaction pool overloaded"
        description: "{{ printf "{{" }} $value {{ "}}" }} pending transactions (${chainName} threshold: {{ .Values.monitoring.alerts.rules.txPoolOverload.threshold }})"
        runbook: "This is normal during high network activity. Monitor for degraded RPC performance."
    {{- end }}

    {{- if .Values.monitoring.alerts.rules.txPoolNearCapacity.enabled }}
    - alert: ${chainUpper}NodeTxPoolNearCapacity
      expr: geth_txpool_pending_count > {{ .Values.monitoring.alerts.rules.txPoolNearCapacity.threshold }}
      for: {{ .Values.monitoring.alerts.rules.txPoolNearCapacity.forDuration }}
      labels:
        severity: critical
        chain: ${chain}
      annotations:
        summary: "Transaction pool near capacity"
        description: "{{ printf "{{" }} $value {{ "}}" }} pending transactions (capacity: 10000)"
        runbook: "Consider increasing txpool.globalslots if this persists"
    {{- end }}

  # Performance Alerts
  - name: ${chain}-node-performance
    interval: 1m
    rules:
    {{- if .Values.monitoring.alerts.rules.highCPUUsage.enabled }}
    - alert: ${chainUpper}NodeHighCPUUsage
      expr: |
        100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > {{ .Values.monitoring.alerts.rules.highCPUUsage.threshold }}
      for: {{ .Values.monitoring.alerts.rules.highCPUUsage.forDuration }}
      labels:
        severity: warning
        chain: ${chain}
      annotations:
        summary: "${chainName} node high CPU usage"
        description: "CPU usage is {{ printf "{{" }} $value {{ "}}" }}% on {{ printf "{{" }} $labels.instance {{ "}}" }}"
        runbook: "Normal during sync. If synced and high, investigate RPC load or stuck processes."
    {{- end }}

    {{- if .Values.monitoring.alerts.rules.highIOWait.enabled }}
    - alert: ${chainUpper}NodeHighIOWait
      expr: rate(node_cpu_seconds_total{mode="iowait"}[5m]) * 100 > {{ .Values.monitoring.alerts.rules.highIOWait.threshold }}
      for: {{ .Values.monitoring.alerts.rules.highIOWait.forDuration }}
      labels:
        severity: warning
        chain: ${chain}
      annotations:
        summary: "High I/O wait time on ${chainName} node"
        description: "System is I/O constrained - check disk performance"
        runbook: "Check disk IOPS and throughput. Blockchain nodes require min 3k IOPS, optimal 8k IOPS."
    {{- end }}

    {{- if .Values.monitoring.alerts.rules.predictDiskFull.enabled }}
    - alert: ${chainUpper}NodePredictDiskFull
      expr: |
        predict_linear(node_filesystem_avail_bytes{mountpoint="/"}[1h], {{ .Values.monitoring.alerts.rules.predictDiskFull.predictHours }} * 3600) < 0
      for: {{ .Values.monitoring.alerts.rules.predictDiskFull.forDuration }}
      labels:
        severity: warning
        chain: ${chain}
      annotations:
        summary: "${chainName} node disk will fill soon"
        description: "Disk is predicted to fill within {{ .Values.monitoring.alerts.rules.predictDiskFull.predictHours }} hours on {{ printf "{{" }} $labels.instance {{ "}}" }}"
        runbook: "Immediate action required - expand storage or prune data"
    {{- end }}
{{- end }}
`;
}
