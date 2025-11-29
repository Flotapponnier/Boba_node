/**
 * ServiceMonitor Generator
 * Creates Prometheus Operator ServiceMonitor resource for automatic metric scraping
 */

export function generateServiceMonitorYaml(chain: string): string {
  return `{{- if and .Values.monitoring .Values.monitoring.enabled .Values.monitoring.serviceMonitor.enabled }}
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: {{ .Values.nodeName }}-metrics
  namespace: {{ .Values.namespace | default "default" }}
  labels:
    app: {{ .Values.nodeName }}
    chain: ${chain}
    release: {{ .Values.monitoring.serviceMonitor.prometheusRelease }}
spec:
  selector:
    matchLabels:
      app: {{ .Values.nodeName }}
  endpoints:
  - port: geth-exporter
    interval: {{ .Values.monitoring.serviceMonitor.interval | default "10s" }}
    path: /metrics
    scheme: http
    honorLabels: true
    relabelings:
    - sourceLabels: [__meta_kubernetes_pod_name]
      targetLabel: pod
    - sourceLabels: [__meta_kubernetes_namespace]
      targetLabel: namespace
    - targetLabel: chain
      replacement: ${chain}
    - targetLabel: node_type
      replacement: {{ .Values.nodeType }}
{{- end }}
`;
}
