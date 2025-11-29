/**
 * Monitoring Generator - Production-grade monitoring setup
 * - Geth Exporter for blockchain metrics
 * - Node Exporter for system metrics
 * - ServiceMonitor for Prometheus scraping
 * - PrometheusRule for comprehensive alerts
 * - Grafana Dashboard with 14 panels (10 blockchain + 4 system)
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
    - alert: ${chainUpper}NodeDown
      expr: up{job="{{ .Values.nodeName }}", chain="${chain}"} == 0
      for: 1m
      labels:
        severity: critical
        chain: ${chain}
      annotations:
        summary: "${chainName} node is down"
        description: "${chainName} node {{ printf "{{" }} $labels.pod {{ "}}" }} is not responding to Prometheus scrapes"
        runbook: "Check pod status: kubectl get pod {{ printf "{{" }} $labels.pod {{ "}}" }} -n {{ printf "{{" }} $labels.namespace {{ "}}" }}"

    - alert: ${chainUpper}NodeNoPeers
      expr: geth_p2p_peers{chain="${chain}"} == 0
      for: 2m
      labels:
        severity: critical
        chain: ${chain}
      annotations:
        summary: "${chainName} node has no peers"
        description: "${chainName} node {{ printf "{{" }} $labels.pod {{ "}}" }} has zero peers connected - network connectivity issue"
        runbook: "Check p2p port is accessible and firewall allows incoming connections"

    - alert: ${chainUpper}NodeSyncStalled
      expr: rate(geth_chain_head_block{chain="${chain}"}[5m]) == 0
      for: 5m
      labels:
        severity: critical
        chain: ${chain}
      annotations:
        summary: "${chainName} node sync has stalled"
        description: "No new blocks processed in the last 5 minutes on {{ printf "{{" }} $labels.pod {{ "}}" }}"
        runbook: "Check logs: kubectl logs {{ printf "{{" }} $labels.pod {{ "}}" }} --tail=100"

    - alert: ${chainUpper}NodeDiskSpaceCritical
      expr: |
        (node_filesystem_avail_bytes{mountpoint="/"} * 100)
        / node_filesystem_size_bytes{mountpoint="/"} < 10
      for: 5m
      labels:
        severity: critical
        chain: ${chain}
      annotations:
        summary: "${chainName} node disk space critically low"
        description: "Less than 10% disk space remaining on {{ printf "{{" }} $labels.instance {{ "}}" }}"
        runbook: "Expand storage or prune blockchain data immediately"

  # Warning Alerts - Investigation Required
  - name: ${chain}-node-warning
    interval: 30s
    rules:
    - alert: ${chainUpper}NodeLowPeerCount
      expr: geth_p2p_peers{chain="${chain}"} < 5
      for: 5m
      labels:
        severity: warning
        chain: ${chain}
      annotations:
        summary: "${chainName} node has low peer count"
        description: "Node {{ printf "{{" }} $labels.pod {{ "}}" }} has only {{ printf "{{" }} $value {{ "}}" }} peers connected (minimum 5 recommended)"
        runbook: "Check network connectivity and p2p configuration"

    - alert: ${chainUpper}NodeSyncLag
      expr: geth_chain_head_header{chain="${chain}"} - geth_chain_head_block{chain="${chain}"} > 0
      for: 5m
      labels:
        severity: warning
        chain: ${chain}
      annotations:
        summary: "${chainName} node is lagging behind"
        description: "Node {{ printf "{{" }} $labels.pod {{ "}}" }} is {{ printf "{{" }} $value {{ "}}" }} blocks behind"
        runbook: "Monitor sync progress. If lag increases, check system resources and network"

    - alert: ${chainUpper}NodeSyncLagCritical
      expr: geth_chain_head_header{chain="${chain}"} - geth_chain_head_block{chain="${chain}"} > 5
      for: 2m
      labels:
        severity: critical
        chain: ${chain}
      annotations:
        summary: "${chainName} node has critical sync lag"
        description: "Node {{ printf "{{" }} $labels.pod {{ "}}" }} is {{ printf "{{" }} $value {{ "}}" }} blocks behind - immediate attention required"
        runbook: "Check system resources (CPU, I/O, memory). Consider restarting node if stuck."

    - alert: ${chainUpper}NodeDiskSpaceWarning
      expr: |
        (node_filesystem_avail_bytes{mountpoint="/"} * 100)
        / node_filesystem_size_bytes{mountpoint="/"} < 20
      for: 10m
      labels:
        severity: warning
        chain: ${chain}
      annotations:
        summary: "${chainName} node disk space low"
        description: "Less than 20% disk space remaining on {{ printf "{{" }} $labels.instance {{ "}}" }}"
        runbook: "Plan storage expansion or data pruning"

    - alert: ${chainUpper}NodeHighMemoryUsage
      expr: |
        (container_memory_working_set_bytes{pod=~"{{ .Values.nodeName }}.*",container=~"${chain}|geth|arbitrum"} * 100)
        / container_spec_memory_limit_bytes{pod=~"{{ .Values.nodeName }}.*",container=~"${chain}|geth|arbitrum"} > 90
      for: 10m
      labels:
        severity: warning
        chain: ${chain}
      annotations:
        summary: "${chainName} node high memory usage"
        description: "Memory usage at {{ printf "{{" }} $value {{ "}}" }}% on {{ printf "{{" }} $labels.pod {{ "}}" }}"
        runbook: "Monitor for OOM kills. Consider increasing memory limits if persistent."

    - alert: ${chainUpper}NodeTxPoolOverload
      expr: geth_txpool_pending{chain="${chain}"} > 5000
      for: 5m
      labels:
        severity: warning
        chain: ${chain}
      annotations:
        summary: "${chainName} node transaction pool overloaded"
        description: "{{ printf "{{" }} $value {{ "}}" }} pending transactions (threshold: 5000)"
        runbook: "This is normal during high network activity. Monitor for degraded RPC performance."

    - alert: ${chainUpper}NodeTxPoolNearCapacity
      expr: geth_txpool_pending{chain="${chain}"} > 8000
      for: 2m
      labels:
        severity: critical
        chain: ${chain}
      annotations:
        summary: "Transaction pool near capacity"
        description: "{{ printf "{{" }} $value {{ "}}" }} pending transactions (capacity: 10000)"
        runbook: "Consider increasing txpool.globalslots if this persists"

  # Performance Alerts
  - name: ${chain}-node-performance
    interval: 1m
    rules:
    - alert: ${chainUpper}NodeHighCPUUsage
      expr: |
        rate(container_cpu_usage_seconds_total{pod=~"{{ .Values.nodeName }}.*",container=~"${chain}|geth|arbitrum"}[5m]) * 100 > 800
      for: 10m
      labels:
        severity: warning
        chain: ${chain}
      annotations:
        summary: "${chainName} node high CPU usage"
        description: "CPU usage is {{ printf "{{" }} $value {{ "}}" }}% (threshold: 800% / 8 cores)"
        runbook: "Normal during sync. If synced and high, investigate RPC load or stuck processes."

    - alert: ${chainUpper}NodeHighIOWait
      expr: rate(node_cpu_seconds_total{mode="iowait"}[5m]) * 100 > 20
      for: 10m
      labels:
        severity: warning
        chain: ${chain}
      annotations:
        summary: "High I/O wait time on ${chainName} node"
        description: "System is I/O constrained - check disk performance"
        runbook: "Check disk IOPS and throughput. Blockchain nodes require min 3k IOPS, optimal 8k IOPS."

    - alert: ${chainUpper}NodePredictDiskFull
      expr: |
        predict_linear(node_filesystem_avail_bytes{mountpoint="/"}[1h], 4 * 3600) < 0
      for: 5m
      labels:
        severity: warning
        chain: ${chain}
      annotations:
        summary: "${chainName} node disk will fill soon"
        description: "Disk is predicted to fill within 4 hours on {{ printf "{{" }} $labels.instance {{ "}}" }}"
        runbook: "Immediate action required - expand storage or prune data"
{{- end }}
`;
}

export function generateGrafanaDashboardConfigMap(chain: string, chainName: string): string {
  const dashboard = {
    annotations: {
      list: [
        {
          builtIn: 1,
          datasource: {
            type: "prometheus",
            uid: "prometheus"
          },
          enable: true,
          hide: true,
          iconColor: "rgba(0, 211, 255, 1)",
          name: "Annotations & Alerts",
          type: "dashboard"
        }
      ]
    },
    editable: true,
    fiscalYearStartMonth: 0,
    graphTooltip: 0,
    id: null,
    links: [],
    liveNow: false,
    panels: [
      // Panel 1: Block Height (stat)
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus"
        },
        fieldConfig: {
          defaults: {
            color: {
              mode: "thresholds"
            },
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                }
              ]
            },
            unit: "none"
          },
          overrides: []
        },
        gridPos: {
          h: 8,
          w: 6,
          x: 0,
          y: 0
        },
        id: 1,
        options: {
          colorMode: "value",
          graphMode: "area",
          justifyMode: "auto",
          orientation: "auto",
          reduceOptions: {
            values: false,
            calcs: ["lastNotNull"],
            fields: ""
          },
          textMode: "auto"
        },
        pluginVersion: "9.0.0",
        targets: [
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "geth_block_number",
            refId: "A"
          }
        ],
        title: "Block Height",
        type: "stat"
      },
      // Panel 2: Node Status (stat)
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus"
        },
        fieldConfig: {
          defaults: {
            color: {
              mode: "thresholds"
            },
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "red",
                  value: null
                },
                {
                  color: "green",
                  value: 1
                }
              ]
            },
            unit: "none"
          },
          overrides: []
        },
        gridPos: {
          h: 8,
          w: 6,
          x: 6,
          y: 0
        },
        id: 2,
        options: {
          colorMode: "value",
          graphMode: "area",
          justifyMode: "auto",
          orientation: "auto",
          reduceOptions: {
            values: false,
            calcs: ["lastNotNull"],
            fields: ""
          },
          textMode: "auto"
        },
        pluginVersion: "9.0.0",
        targets: [
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "sum(up{job=~\".*{{ .Values.nodeName }}.*\"})",
            refId: "A"
          }
        ],
        title: "Node Status (1=UP)",
        type: "stat"
      },
      // Panel 3: Pending Transactions (stat)
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus"
        },
        fieldConfig: {
          defaults: {
            color: {
              mode: "thresholds"
            },
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                },
                {
                  color: "yellow",
                  value: 1000
                },
                {
                  color: "red",
                  value: 5000
                }
              ]
            },
            unit: "none"
          },
          overrides: []
        },
        gridPos: {
          h: 8,
          w: 6,
          x: 12,
          y: 0
        },
        id: 3,
        options: {
          colorMode: "value",
          graphMode: "area",
          justifyMode: "auto",
          orientation: "auto",
          reduceOptions: {
            values: false,
            calcs: ["lastNotNull"],
            fields: ""
          },
          textMode: "auto"
        },
        pluginVersion: "9.0.0",
        targets: [
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "geth_txpool_pending_count",
            refId: "A"
          }
        ],
        title: "Pending Transactions",
        type: "stat"
      },
      // Panel 4: Block Time (stat)
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus"
        },
        fieldConfig: {
          defaults: {
            color: {
              mode: "thresholds"
            },
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                },
                {
                  color: "yellow",
                  value: 5
                },
                {
                  color: "red",
                  value: 10
                }
              ]
            },
            unit: "s"
          },
          overrides: []
        },
        gridPos: {
          h: 8,
          w: 6,
          x: 18,
          y: 0
        },
        id: 4,
        options: {
          colorMode: "value",
          graphMode: "area",
          justifyMode: "auto",
          orientation: "auto",
          reduceOptions: {
            values: false,
            calcs: ["lastNotNull"],
            fields: ""
          },
          textMode: "auto"
        },
        pluginVersion: "9.0.0",
        targets: [
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "geth_block_delta_seconds",
            refId: "A"
          }
        ],
        title: "Block Time (seconds)",
        type: "stat"
      },
      // Panel 5: Block Number Over Time (timeseries)
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus"
        },
        fieldConfig: {
          defaults: {
            color: {
              mode: "palette-classic"
            },
            custom: {
              axisCenteredZero: false,
              axisColorMode: "text",
              axisLabel: "",
              axisPlacement: "auto",
              barAlignment: 0,
              drawStyle: "line",
              fillOpacity: 10,
              gradientMode: "none",
              hideFrom: {
                tooltip: false,
                viz: false,
                legend: false
              },
              lineInterpolation: "linear",
              lineWidth: 1,
              pointSize: 5,
              scaleDistribution: {
                type: "linear"
              },
              showPoints: "never",
              spanNulls: false,
              stacking: {
                group: "A",
                mode: "none"
              },
              thresholdsStyle: {
                mode: "off"
              }
            },
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                }
              ]
            },
            unit: "none"
          },
          overrides: []
        },
        gridPos: {
          h: 9,
          w: 12,
          x: 0,
          y: 8
        },
        id: 5,
        options: {
          legend: {
            calcs: [],
            displayMode: "list",
            placement: "bottom",
            showLegend: true
          },
          tooltip: {
            mode: "single",
            sort: "none"
          }
        },
        pluginVersion: "9.0.0",
        targets: [
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "geth_block_number",
            refId: "A",
            legendFormat: "Block Number"
          }
        ],
        title: "Block Number Over Time",
        type: "timeseries"
      },
      // Panel 6: Transactions per Block (timeseries)
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus"
        },
        fieldConfig: {
          defaults: {
            color: {
              mode: "palette-classic"
            },
            custom: {
              axisCenteredZero: false,
              axisColorMode: "text",
              axisLabel: "",
              axisPlacement: "auto",
              barAlignment: 0,
              drawStyle: "line",
              fillOpacity: 10,
              gradientMode: "none",
              hideFrom: {
                tooltip: false,
                viz: false,
                legend: false
              },
              lineInterpolation: "linear",
              lineWidth: 1,
              pointSize: 5,
              scaleDistribution: {
                type: "linear"
              },
              showPoints: "never",
              spanNulls: false,
              stacking: {
                group: "A",
                mode: "none"
              },
              thresholdsStyle: {
                mode: "off"
              }
            },
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                }
              ]
            },
            unit: "none"
          },
          overrides: []
        },
        gridPos: {
          h: 9,
          w: 12,
          x: 12,
          y: 8
        },
        id: 6,
        options: {
          legend: {
            calcs: [],
            displayMode: "list",
            placement: "bottom",
            showLegend: true
          },
          tooltip: {
            mode: "single",
            sort: "none"
          }
        },
        pluginVersion: "9.0.0",
        targets: [
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "geth_block_transactions_count",
            refId: "A",
            legendFormat: "Transactions per Block"
          }
        ],
        title: "Transactions per Block",
        type: "timeseries"
      },
      // Panel 7: Gas Usage % (timeseries)
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus"
        },
        fieldConfig: {
          defaults: {
            color: {
              mode: "palette-classic"
            },
            custom: {
              axisCenteredZero: false,
              axisColorMode: "text",
              axisLabel: "",
              axisPlacement: "auto",
              barAlignment: 0,
              drawStyle: "line",
              fillOpacity: 10,
              gradientMode: "none",
              hideFrom: {
                tooltip: false,
                viz: false,
                legend: false
              },
              lineInterpolation: "linear",
              lineWidth: 1,
              pointSize: 5,
              scaleDistribution: {
                type: "linear"
              },
              showPoints: "never",
              spanNulls: false,
              stacking: {
                group: "A",
                mode: "none"
              },
              thresholdsStyle: {
                mode: "off"
              }
            },
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                }
              ]
            },
            unit: "percent"
          },
          overrides: []
        },
        gridPos: {
          h: 9,
          w: 12,
          x: 0,
          y: 17
        },
        id: 7,
        options: {
          legend: {
            calcs: [],
            displayMode: "list",
            placement: "bottom",
            showLegend: true
          },
          tooltip: {
            mode: "single",
            sort: "none"
          }
        },
        pluginVersion: "9.0.0",
        targets: [
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "(geth_block_gas_used / geth_block_gas_limit) * 100",
            refId: "A",
            legendFormat: "Gas Usage %"
          }
        ],
        title: "Gas Usage %",
        type: "timeseries"
      },
      // Panel 8: Block Size (timeseries)
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus"
        },
        fieldConfig: {
          defaults: {
            color: {
              mode: "palette-classic"
            },
            custom: {
              axisCenteredZero: false,
              axisColorMode: "text",
              axisLabel: "",
              axisPlacement: "auto",
              barAlignment: 0,
              drawStyle: "line",
              fillOpacity: 10,
              gradientMode: "none",
              hideFrom: {
                tooltip: false,
                viz: false,
                legend: false
              },
              lineInterpolation: "linear",
              lineWidth: 1,
              pointSize: 5,
              scaleDistribution: {
                type: "linear"
              },
              showPoints: "never",
              spanNulls: false,
              stacking: {
                group: "A",
                mode: "none"
              },
              thresholdsStyle: {
                mode: "off"
              }
            },
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                }
              ]
            },
            unit: "short"
          },
          overrides: []
        },
        gridPos: {
          h: 9,
          w: 12,
          x: 12,
          y: 17
        },
        id: 8,
        options: {
          legend: {
            calcs: [],
            displayMode: "list",
            placement: "bottom",
            showLegend: true
          },
          tooltip: {
            mode: "single",
            sort: "none"
          }
        },
        pluginVersion: "9.0.0",
        targets: [
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "geth_block_size_bytes",
            refId: "A",
            legendFormat: "Block Size (bytes)"
          }
        ],
        title: "Block Size",
        type: "timeseries"
      },
      // Panel 9: Transaction Pool (timeseries)
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus"
        },
        fieldConfig: {
          defaults: {
            color: {
              mode: "palette-classic"
            },
            custom: {
              axisCenteredZero: false,
              axisColorMode: "text",
              axisLabel: "",
              axisPlacement: "auto",
              barAlignment: 0,
              drawStyle: "line",
              fillOpacity: 10,
              gradientMode: "none",
              hideFrom: {
                tooltip: false,
                viz: false,
                legend: false
              },
              lineInterpolation: "linear",
              lineWidth: 1,
              pointSize: 5,
              scaleDistribution: {
                type: "linear"
              },
              showPoints: "never",
              spanNulls: false,
              stacking: {
                group: "A",
                mode: "none"
              },
              thresholdsStyle: {
                mode: "off"
              }
            },
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                }
              ]
            },
            unit: "short"
          },
          overrides: []
        },
        gridPos: {
          h: 9,
          w: 12,
          x: 0,
          y: 26
        },
        id: 9,
        options: {
          legend: {
            calcs: [],
            displayMode: "list",
            placement: "bottom",
            showLegend: true
          },
          tooltip: {
            mode: "single",
            sort: "none"
          }
        },
        pluginVersion: "9.0.0",
        targets: [
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "geth_txpool_pending_count",
            refId: "A",
            legendFormat: "Pending Transactions"
          }
        ],
        title: "Transaction Pool",
        type: "timeseries"
      },
      // Panel 10: Block Processing Time (timeseries)
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus"
        },
        fieldConfig: {
          defaults: {
            color: {
              mode: "palette-classic"
            },
            custom: {
              axisCenteredZero: false,
              axisColorMode: "text",
              axisLabel: "",
              axisPlacement: "auto",
              barAlignment: 0,
              drawStyle: "line",
              fillOpacity: 10,
              gradientMode: "none",
              hideFrom: {
                tooltip: false,
                viz: false,
                legend: false
              },
              lineInterpolation: "linear",
              lineWidth: 1,
              pointSize: 5,
              scaleDistribution: {
                type: "linear"
              },
              showPoints: "never",
              spanNulls: false,
              stacking: {
                group: "A",
                mode: "none"
              },
              thresholdsStyle: {
                mode: "off"
              }
            },
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                }
              ]
            },
            unit: "s"
          },
          overrides: []
        },
        gridPos: {
          h: 9,
          w: 12,
          x: 12,
          y: 26
        },
        id: 10,
        options: {
          legend: {
            calcs: [],
            displayMode: "list",
            placement: "bottom",
            showLegend: true
          },
          tooltip: {
            mode: "single",
            sort: "none"
          }
        },
        pluginVersion: "9.0.0",
        targets: [
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "geth_block_delta_seconds",
            refId: "A",
            legendFormat: "Block Delta (seconds)"
          },
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "geth_block_delta_subjective_seconds",
            refId: "B",
            legendFormat: "Block Delta Subjective (seconds)"
          }
        ],
        title: "Block Processing Time",
        type: "timeseries"
      },
      // Panel 11: CPU Usage % (stat)
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus"
        },
        fieldConfig: {
          defaults: {
            color: {
              mode: "thresholds"
            },
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                },
                {
                  color: "yellow",
                  value: 70
                },
                {
                  color: "red",
                  value: 90
                }
              ]
            },
            unit: "percent"
          }
        },
        gridPos: {
          h: 8,
          w: 6,
          x: 0,
          y: 35
        },
        id: 11,
        options: {
          colorMode: "value",
          graphMode: "area",
          justifyMode: "auto",
          orientation: "auto",
          reduceOptions: {
            values: false,
            calcs: ["lastNotNull"],
            fields: ""
          },
          textMode: "auto"
        },
        targets: [
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "100 - (avg(rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            refId: "A"
          }
        ],
        title: "CPU Usage %",
        type: "stat"
      },
      // Panel 12: Memory Usage % (stat)
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus"
        },
        fieldConfig: {
          defaults: {
            color: {
              mode: "thresholds"
            },
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                },
                {
                  color: "yellow",
                  value: 70
                },
                {
                  color: "red",
                  value: 90
                }
              ]
            },
            unit: "percent"
          }
        },
        gridPos: {
          h: 8,
          w: 6,
          x: 6,
          y: 35
        },
        id: 12,
        options: {
          colorMode: "value",
          graphMode: "area",
          justifyMode: "auto",
          orientation: "auto",
          reduceOptions: {
            values: false,
            calcs: ["lastNotNull"],
            fields: ""
          },
          textMode: "auto"
        },
        targets: [
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "(1 - (node_memory_MemFree_bytes / node_memory_MemTotal_bytes)) * 100",
            refId: "A"
          }
        ],
        title: "Memory Usage %",
        type: "stat"
      },
      // Panel 13: Disk Usage % (stat)
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus"
        },
        fieldConfig: {
          defaults: {
            color: {
              mode: "thresholds"
            },
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                },
                {
                  color: "yellow",
                  value: 80
                },
                {
                  color: "red",
                  value: 95
                }
              ]
            },
            unit: "percent"
          }
        },
        gridPos: {
          h: 8,
          w: 6,
          x: 12,
          y: 35
        },
        id: 13,
        options: {
          colorMode: "value",
          graphMode: "area",
          justifyMode: "auto",
          orientation: "auto",
          reduceOptions: {
            values: false,
            calcs: ["lastNotNull"],
            fields: ""
          },
          textMode: "auto"
        },
        targets: [
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "100 - ((node_filesystem_avail_bytes{mountpoint=\"/\"} / node_filesystem_size_bytes{mountpoint=\"/\"}) * 100)",
            refId: "A"
          }
        ],
        title: "Disk Usage % (/)",
        type: "stat"
      },
      // Panel 14: Network Traffic (timeseries)
      {
        datasource: {
          type: "prometheus",
          uid: "prometheus"
        },
        fieldConfig: {
          defaults: {
            color: {
              mode: "palette-classic"
            },
            custom: {
              axisCenteredZero: false,
              axisColorMode: "text",
              axisLabel: "",
              axisPlacement: "auto",
              barAlignment: 0,
              drawStyle: "line",
              fillOpacity: 10,
              gradientMode: "none",
              hideFrom: {
                tooltip: false,
                viz: false,
                legend: false
              },
              lineInterpolation: "linear",
              lineWidth: 1,
              pointSize: 5,
              scaleDistribution: {
                type: "linear"
              },
              showPoints: "never",
              spanNulls: false,
              stacking: {
                group: "A",
                mode: "none"
              },
              thresholdsStyle: {
                mode: "off"
              }
            },
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                }
              ]
            },
            unit: "Bps"
          }
        },
        gridPos: {
          h: 8,
          w: 6,
          x: 18,
          y: 35
        },
        id: 14,
        options: {
          legend: {
            calcs: [],
            displayMode: "list",
            placement: "bottom",
            showLegend: true
          },
          tooltip: {
            mode: "single",
            sort: "none"
          }
        },
        targets: [
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "rate(node_network_receive_bytes_total{device!~\"lo|veth.*\"}[5m])",
            refId: "A",
            legendFormat: "RX {{device}}"
          },
          {
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            },
            expr: "rate(node_network_transmit_bytes_total{device!~\"lo|veth.*\"}[5m])",
            refId: "B",
            legendFormat: "TX {{device}}"
          }
        ],
        title: "Network Traffic",
        type: "timeseries"
      }
    ],
    refresh: "10s",
    schemaVersion: 36,
    style: "dark",
    tags: [chain, "blockchain", "node"],
    templating: {
      list: []
    },
    time: {
      from: "now-1h",
      to: "now"
    },
    timepicker: {},
    timezone: "",
    title: `${chainName} Node - Overview`,
    uid: `${chain}-node-overview`,
    version: 1,
    weekStart: ""
  };

  const dashboardJson = JSON.stringify(dashboard, null, 2)
    // Escape {{ and }} for Helm templating - replace with Helm printf syntax
    .replace(/\{\{/g, '{{ "{{" }}')
    .replace(/\}\}/g, '{{ "}}" }}');

  return `{{- if and .Values.monitoring.enabled .Values.monitoring.grafana.dashboards.enabled }}
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Values.nodeName }}-grafana-dashboard
  namespace: {{ .Values.namespace | default "default" }}
  labels:
    app: {{ .Values.nodeName }}
    chain: ${chain}
    grafana_dashboard: "1"
data:
  ${chain}-node-dashboard.json: |
${dashboardJson.split('\n').map(line => '    ' + line).join('\n')}
{{- end }}
`;
}
