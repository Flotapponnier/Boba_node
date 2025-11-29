/**
 * Grafana Dashboard Generator
 * Creates pre-configured Grafana dashboard with blockchain and system metrics
 * 14 panels: Block Height, Node Status, Pending TX, Block Number, TX/Block, Gas Usage,
 * Block Size, TX Pool, Processing Time, CPU, Memory, Disk, Network
 */

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

  // Convert dashboard to JSON and escape {{ }} for Helm using placeholders
  const dashboardJson = JSON.stringify(dashboard, null, 2)
    .split('{{').join('__HELM_OPEN__')
    .split('}}').join('__HELM_CLOSE__')
    .split('__HELM_OPEN__').join('{{ "{{" }}')
    .split('__HELM_CLOSE__').join('{{ "}}" }}');

  return `{{- if and .Values.monitoring.enabled .Values.monitoring.grafanaDashboard }}
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
