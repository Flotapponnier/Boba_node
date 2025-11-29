/**
 * Monitoring Generator - Production-grade monitoring setup
 * - Geth Exporter for blockchain metrics
 * - Node Exporter for system metrics
 * - ServiceMonitor for Prometheus scraping
 * - PrometheusRule for configurable alerts
 * - Grafana Dashboard with 14 panels (10 blockchain + 4 system)
 *
 * Refactored into modular architecture:
 * - monitoring/serviceMonitor.ts: ServiceMonitor CRD
 * - monitoring/prometheusRule.ts: Dynamic alert generation
 * - monitoring/grafanaDashboard.ts: Grafana dashboard ConfigMap
 */

export {
  generateServiceMonitorYaml,
  generatePrometheusRuleYaml,
  generateGrafanaDashboardConfigMap
} from './monitoring';
