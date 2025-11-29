/**
 * Monitoring Module - Production-grade monitoring stack
 *
 * Exports:
 * - ServiceMonitor: Prometheus Operator ServiceMonitor for metric scraping
 * - PrometheusRule: Configurable alerts with user-defined thresholds
 * - GrafanaDashboard: Pre-configured dashboard with 14 panels
 *
 * Architecture:
 * - serviceMonitor.ts: Prometheus ServiceMonitor CRD
 * - prometheusRule.ts: Dynamic alert generation based on user config
 * - grafanaDashboard.ts: Grafana dashboard ConfigMap with blockchain + system metrics
 */

export { generateServiceMonitorYaml } from './serviceMonitor';
export { generatePrometheusRuleYaml } from './prometheusRule';
export { generateGrafanaDashboardConfigMap } from './grafanaDashboard';
