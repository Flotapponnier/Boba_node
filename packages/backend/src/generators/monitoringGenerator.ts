export function generateServiceMonitorYaml(): string {
  return `{{- if .Values.monitoring.enabled }}
{{- if .Values.monitoring.prometheusOperator }}
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: {{ .Values.nodeName }}-metrics
  labels:
    app: {{ .Values.nodeName }}
    chain: bsc
    release: prometheus-operator
spec:
  selector:
    matchLabels:
      app: {{ .Values.nodeName }}
  endpoints:
  - port: metrics
    interval: {{ .Values.monitoring.serviceMonitor.interval | default "30s" }}
    scrapeTimeout: {{ .Values.monitoring.serviceMonitor.scrapeTimeout | default "10s" }}
    path: /debug/metrics/prometheus
{{- end }}
{{- end }}
`;
}

export function generatePrometheusRuleYaml(): string {
  return `{{- if .Values.monitoring.enabled }}
{{- if .Values.monitoring.prometheusOperator }}
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: {{ .Values.nodeName }}-alerts
  labels:
    app: {{ .Values.nodeName }}
    chain: bsc
    release: prometheus-operator
spec:
  groups:
  - name: bsc-node-alerts
    interval: 30s
    rules:
    - alert: BSCNodeDown
      expr: up{job="{{ .Values.nodeName }}-metrics"} == 0
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "BSC Node {{ .Values.nodeName }} is down"
        description: "BSC Node has been down for more than 5 minutes"

    - alert: BSCNodeOutOfSync
      expr: (timestamp(eth_block_number{job="{{ .Values.nodeName }}-metrics"}) - eth_block_number) > 300
      for: 10m
      labels:
        severity: warning
      annotations:
        summary: "BSC Node {{ .Values.nodeName }} is out of sync"
        description: "Node is more than 300 blocks behind"

    - alert: BSCNodeNoPeers
      expr: p2p_peers{job="{{ .Values.nodeName }}-metrics"} < 3
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "BSC Node {{ .Values.nodeName }} has too few peers"
        description: "Node has less than 3 peers for more than 5 minutes"

    - alert: BSCNodeHighMemory
      expr: go_memstats_alloc_bytes{job="{{ .Values.nodeName }}-metrics"} > 50000000000
      for: 15m
      labels:
        severity: warning
      annotations:
        summary: "BSC Node {{ .Values.nodeName }} memory usage is high"
        description: "Node is using more than 50GB of memory"

    - alert: BSCNodeDiskSpaceLow
      expr: node_filesystem_avail_bytes{mountpoint="/data"} < 107374182400
      for: 30m
      labels:
        severity: critical
      annotations:
        summary: "BSC Node {{ .Values.nodeName }} disk space is low"
        description: "Less than 100GB of disk space remaining"
{{- end }}
{{- end }}
`;
}

export function generateGrafanaDashboardConfigMap(): string {
  const dashboard = {
    annotations: {
      list: [
        {
          builtIn: 1,
          datasource: "-- Grafana --",
          enable: true,
          hide: true,
          iconColor: "rgba(0, 211, 255, 1)",
          name: "Annotations & Alerts",
          type: "dashboard"
        }
      ]
    },
    editable: true,
    gnetId: null,
    graphTooltip: 0,
    links: [],
    panels: [
      {
        title: "Block Height",
        targets: [
          {
            expr: "eth_block_number",
            legendFormat: "Current Block"
          }
        ],
        type: "graph",
        gridPos: { h: 8, w: 12, x: 0, y: 0 }
      },
      {
        title: "Peer Count",
        targets: [
          {
            expr: "p2p_peers",
            legendFormat: "Peers"
          }
        ],
        type: "graph",
        gridPos: { h: 8, w: 12, x: 12, y: 0 }
      },
      {
        title: "Memory Usage",
        targets: [
          {
            expr: "go_memstats_alloc_bytes / 1024 / 1024 / 1024",
            legendFormat: "Memory (GB)"
          }
        ],
        type: "graph",
        gridPos: { h: 8, w: 12, x: 0, y: 8 }
      },
      {
        title: "Transaction Pool",
        targets: [
          {
            expr: "txpool_pending",
            legendFormat: "Pending"
          },
          {
            expr: "txpool_queued",
            legendFormat: "Queued"
          }
        ],
        type: "graph",
        gridPos: { h: 8, w: 12, x: 12, y: 8 }
      },
      {
        title: "RPC Request Rate",
        targets: [
          {
            expr: "rate(rpc_requests_total[5m])",
            legendFormat: "{{method}}"
          }
        ],
        type: "graph",
        gridPos: { h: 8, w: 24, x: 0, y: 16 }
      }
    ],
    schemaVersion: 27,
    style: "dark",
    tags: ["bsc", "blockchain"],
    templating: {
      list: []
    },
    time: {
      from: "now-6h",
      to: "now"
    },
    timepicker: {},
    timezone: "",
    title: "BSC Node Dashboard",
    uid: "bsc-node",
    version: 0
  };

  return `{{- if .Values.monitoring.enabled }}
{{- if .Values.monitoring.grafanaDashboard }}
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Values.nodeName }}-grafana-dashboard
  labels:
    app: {{ .Values.nodeName }}
    chain: bsc
    grafana_dashboard: "1"
data:
  bsc-node-dashboard.json: |
${JSON.stringify(dashboard, null, 4).split('\n').map(line => '    ' + line).join('\n')}
{{- end }}
{{- end }}
`;
}
