import { ArbConfig } from '../types/arbConfig';
import { generateServiceYaml } from './commonGenerators';
import {
  generateServiceMonitorYaml,
  generatePrometheusRuleYaml,
  generateGrafanaDashboardConfigMap,
} from './monitoringGenerator';

export function generateArbStatefulSetYaml(config: ArbConfig): string {
  const containerArgs: string[] = [
    `--chain.id=${config.config.chainId}`,
    `--chain.name=${config.config.chainName}`,
    `--parent-chain.connection.url=${config.config.parentChainUrl}`,
  ];

  // Add beacon URL if provided
  if (config.config.parentChainBeaconUrl) {
    containerArgs.push(`--parent-chain.blob-client.beacon-url=${config.config.parentChainBeaconUrl}`);
  }

  // HTTP Configuration
  containerArgs.push(
    `--http.addr=${config.config.httpAddr}`,
    `--http.port=${config.config.httpPort}`,
    `--http.api=${config.config.httpApi}`,
    `--http.vhosts=${config.config.httpVhosts}`,
    `--http.corsdomain=${config.config.httpCorsdomain}`
  );

  // WebSocket Configuration
  if (config.config.wsEnable) {
    containerArgs.push(
      `--ws.addr=${config.config.wsAddr}`,
      `--ws.port=${config.config.wsPort}`,
      `--ws.api=${config.config.wsApi}`,
      `--ws.origins=${config.config.wsOrigins}`
    );
  }

  // Sequencer Feed
  containerArgs.push(`--node.feed.input.url=${config.config.feedInputUrl}`);
  if (config.config.feedInputSecondaryUrl) {
    containerArgs.push(`--node.feed.input.secondary-url=${config.config.feedInputSecondaryUrl}`);
  }

  // Pruning & Caching
  if (config.config.executionCachingArchive) {
    containerArgs.push('--execution.caching.archive');
  }
  if (config.config.pruneMode !== 'archive') {
    containerArgs.push(`--init.prune=${config.config.pruneMode}`);
  }
  containerArgs.push(
    `--caching.trie-time-limit=${config.config.cachingTrieTimeLimit}`,
    `--caching.snapshot-keep=${config.config.cachingSnapshotKeep}`
  );
  if (config.config.cachingSnapshotRestore) {
    containerArgs.push('--caching.snapshot-restore');
  }

  // Snapshot Initialization
  if (config.snapshot?.enabled) {
    if (config.config.initLatest) {
      containerArgs.push(`--init.latest=${config.config.initLatest}`);
    }
    if (config.config.initUrl || config.snapshot.url) {
      containerArgs.push(`--init.url=${config.snapshot.url || config.config.initUrl}`);
    }
  }

  // Validator/Staker Configuration
  if (config.config.stakerEnable) {
    containerArgs.push('--node.staker.enable=true');
    if (config.config.stakerStrategy) {
      containerArgs.push(`--node.staker.strategy=${config.config.stakerStrategy}`);
    }
    if (config.config.stakerParentChainWalletPassword) {
      containerArgs.push(`--node.staker.parent-chain-wallet.password={{ .Values.config.stakerParentChainWalletPassword }}`);
    }
    if (config.config.stakerParentChainWalletPrivateKey) {
      containerArgs.push(`--node.staker.parent-chain-wallet.private-key={{ .Values.config.stakerParentChainWalletPrivateKey }}`);
    }
  }

  // Metrics
  if (config.config.metricsEnable) {
    containerArgs.push(
      `--metrics`,
      `--metrics.addr=${config.config.metricsAddr}`,
      `--metrics.port=${config.config.metricsPort}`
    );
  }

  // Logging
  containerArgs.push(
    `--log-level=${config.config.logLevel}`,
    `--log-type=${config.config.logType}`
  );

  // P2P Configuration
  containerArgs.push(`--p2p.max-peers=${config.config.p2pMaxPeers}`);
  if (config.config.p2pNoDiscovery) {
    containerArgs.push('--p2p.no-discovery');
  }

  // Data Availability
  if (config.config.nodeDataAvailabilityEnable) {
    containerArgs.push('--node.data-availability.enable');
  }

  // Advanced RPC settings
  if (config.config.nodeRpc) {
    containerArgs.push(
      `--node.rpc.max-batch-size=${config.config.nodeRpc.maxBatchSize}`,
      `--node.rpc.max-request-content-length=${config.config.nodeRpc.maxRequestContentLength}`
    );
  }

  const formattedArgs = containerArgs.map(arg => `            - "${arg}"`).join('\n');

  // Generate init container for snapshot download if enabled
  const initContainer = config.snapshot?.enabled ? `
      initContainers:
        - name: download-snapshot
          image: busybox:latest
          command:
            - sh
            - -c
            - |
              if [ ! -d "/data/arbitrum/nitro" ]; then
                echo "Downloading Arbitrum snapshot..."
                wget -O /tmp/snapshot.tar "${config.snapshot.url}"
                mkdir -p /data/arbitrum
                tar -xvf /tmp/snapshot.tar -C /data/arbitrum
                rm /tmp/snapshot.tar
                echo "Snapshot download complete"
              else
                echo "Data directory already exists, skipping snapshot download"
              fi
          volumeMounts:
            - name: data
              mountPath: /data
` : '';

  return `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: {{ .Values.nodeName }}
  namespace: {{ .Values.namespace }}
  labels:
    app: {{ .Values.nodeName }}
    chain: arbitrum
    nodeType: {{ .Values.nodeType }}
spec:
  serviceName: {{ .Values.nodeName }}
  replicas: 1
  selector:
    matchLabels:
      app: {{ .Values.nodeName }}
  template:
    metadata:
      labels:
        app: {{ .Values.nodeName }}
        chain: arbitrum
        nodeType: {{ .Values.nodeType }}
    spec:${initContainer}
      containers:
        - name: arbitrum-node
          image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          args:
${formattedArgs}
          ports:
            - name: http
              containerPort: {{ .Values.service.ports.http.port }}
              protocol: TCP
            - name: ws
              containerPort: {{ .Values.service.ports.ws.port }}
              protocol: TCP
            - name: metrics
              containerPort: {{ .Values.service.ports.metrics.port }}
              protocol: TCP
            - name: sequencer-feed
              containerPort: {{ .Values.service.ports.p2p.port }}
              protocol: TCP
          volumeMounts:
            - name: data
              mountPath: /home/user/.arbitrum
          resources:
            requests:
              cpu: {{ .Values.resources.requests.cpu }}
              memory: {{ .Values.resources.requests.memory }}
{{- if .Values.resources.limits }}
            limits:
{{- if .Values.resources.limits.cpu }}
              cpu: {{ .Values.resources.limits.cpu }}
{{- end }}
{{- if .Values.resources.limits.memory }}
              memory: {{ .Values.resources.limits.memory }}
{{- end }}
{{- end }}
{{- if .Values.livenessProbe }}
{{- if .Values.livenessProbe.enabled }}
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: {{ .Values.livenessProbe.initialDelaySeconds }}
            periodSeconds: {{ .Values.livenessProbe.periodSeconds }}
            timeoutSeconds: {{ .Values.livenessProbe.timeoutSeconds }}
            failureThreshold: {{ .Values.livenessProbe.failureThreshold }}
{{- end }}
{{- end }}
{{- if .Values.readinessProbe }}
{{- if .Values.readinessProbe.enabled }}
          readinessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: {{ .Values.readinessProbe.initialDelaySeconds }}
            periodSeconds: {{ .Values.readinessProbe.periodSeconds }}
            timeoutSeconds: {{ .Values.readinessProbe.timeoutSeconds }}
            failureThreshold: {{ .Values.readinessProbe.failureThreshold }}
{{- end }}
{{- end }}
{{- if and .Values.monitoring .Values.monitoring.enabled .Values.monitoring.gethExporter.enabled }}
        # Geth Exporter Sidecar - Exposes Prometheus metrics from RPC
        - name: geth-exporter
          image: {{ .Values.monitoring.gethExporter.image.repository }}:{{ .Values.monitoring.gethExporter.image.tag }}
          imagePullPolicy: {{ .Values.monitoring.gethExporter.image.pullPolicy }}
          env:
            - name: GETH
              value: "{{ .Values.monitoring.gethExporter.rpcUrl }}"
            - name: DELAY
              value: "1000"
          ports:
            - name: exporter
              containerPort: {{ .Values.monitoring.gethExporter.port }}
              protocol: TCP
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 200m
              memory: 128Mi
          livenessProbe:
            httpGet:
              path: /metrics
              port: exporter
            initialDelaySeconds: 30
            periodSeconds: 10
{{- end }}
      securityContext:
        fsGroup: 1000
        runAsUser: 1000
        runAsNonRoot: true
{{- if .Values.persistence.enabled }}
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: {{ .Values.persistence.storageClass }}
        resources:
          requests:
            storage: {{ .Values.persistence.size }}
{{- else }}
      volumes:
        - name: data
          emptyDir: {}
{{- end }}
`;
}

export function generateArbHelmChart(config: ArbConfig): Record<string, string> {
  const files: Record<string, string> = {};

  // Chart.yaml
  files['Chart.yaml'] = `apiVersion: v2
name: ${config.deploymentName}
description: Arbitrum ${config.nodeType} node Helm chart
type: application
version: 1.0.0
appVersion: "${config.image.tag}"
keywords:
  - arbitrum
  - blockchain
  - layer2
  - nitro
home: https://arbitrum.io
sources:
  - https://github.com/OffchainLabs/nitro
maintainers:
  - name: Boba Node Team
`;

  // values.yaml
  files[`values-${config.deploymentName}.yaml`] = `# Arbitrum ${config.nodeType} Node Configuration
deploymentName: ${config.deploymentName}
nodeName: ${config.nodeName}
nodeType: ${config.nodeType}
namespace: ${config.namespace}

image:
  repository: ${config.image.repository}
  tag: ${config.image.tag}
  pullPolicy: ${config.image.pullPolicy}

service:
  type: ${config.service.type}
  ports:
    http:
      port: ${config.service.ports.http.port}
    ws:
      port: ${config.service.ports.ws.port}
    metrics:
      port: ${config.service.ports.metrics.port}
    p2p:
      port: ${config.service.ports.p2p.port}

config:
  chainId: ${config.config.chainId}
  chainName: ${config.config.chainName}
  parentChainUrl: ${config.config.parentChainUrl}
${config.config.parentChainBeaconUrl ? `  parentChainBeaconUrl: ${config.config.parentChainBeaconUrl}` : ''}
  pruneMode: ${config.config.pruneMode}
  executionCachingArchive: ${config.config.executionCachingArchive}
  httpApi: ${config.config.httpApi}
  httpAddr: ${config.config.httpAddr}
  httpPort: ${config.config.httpPort}
  httpVhosts: ${config.config.httpVhosts}
  httpCorsdomain: ${config.config.httpCorsdomain}
  wsEnable: ${config.config.wsEnable}
  wsAddr: ${config.config.wsAddr}
  wsPort: ${config.config.wsPort}
  wsApi: ${config.config.wsApi}
  wsOrigins: ${config.config.wsOrigins}
  feedInputUrl: ${config.config.feedInputUrl}
${config.config.feedInputSecondaryUrl ? `  feedInputSecondaryUrl: ${config.config.feedInputSecondaryUrl}` : ''}
  stakerEnable: ${config.config.stakerEnable}
${config.config.stakerStrategy ? `  stakerStrategy: ${config.config.stakerStrategy}` : ''}
  cachingTrieTimeLimit: ${config.config.cachingTrieTimeLimit}
  cachingSnapshotKeep: ${config.config.cachingSnapshotKeep}
  cachingSnapshotRestore: ${config.config.cachingSnapshotRestore}
  metricsEnable: ${config.config.metricsEnable}
  metricsPort: ${config.config.metricsPort}
  metricsAddr: ${config.config.metricsAddr}
  logLevel: ${config.config.logLevel}
  logType: ${config.config.logType}
  p2pMaxPeers: ${config.config.p2pMaxPeers}
  p2pNoDiscovery: ${config.config.p2pNoDiscovery}
  nodeDataAvailabilityEnable: ${config.config.nodeDataAvailabilityEnable}
${config.config.initLatest ? `  initLatest: ${config.config.initLatest}` : ''}

resources:
  requests:
    cpu: ${config.resources.requests.cpu}
    memory: ${config.resources.requests.memory}
${config.resources.limits ? `  limits:
${config.resources.limits.cpu ? `    cpu: ${config.resources.limits.cpu}` : ''}
${config.resources.limits.memory ? `    memory: ${config.resources.limits.memory}` : ''}` : ''}

persistence:
  enabled: ${config.persistence.enabled}
  storageClass: ${config.persistence.storageClass}
  size: ${config.persistence.size}

${config.snapshot?.enabled ? `snapshot:
  enabled: true
  url: ${config.snapshot.url}
${config.snapshot.checksum ? `  checksum: ${config.snapshot.checksum}` : ''}` : ''}

${config.monitoring?.enabled ? `monitoring:
  enabled: true
  prometheusOperator: ${config.monitoring.prometheusOperator}
  grafanaDashboard: ${config.monitoring.grafanaDashboard}
${config.monitoring.gethExporter?.enabled ? `  gethExporter:
    enabled: true
    image:
      repository: ${config.monitoring.gethExporter.image.repository}
      tag: ${config.monitoring.gethExporter.image.tag}
      pullPolicy: ${config.monitoring.gethExporter.image.pullPolicy}
    rpcUrl: ${config.monitoring.gethExporter.rpcUrl}
    port: ${config.monitoring.gethExporter.port}` : ''}
${config.monitoring.serviceMonitor?.enabled ? `  serviceMonitor:
    enabled: true
    interval: ${config.monitoring.serviceMonitor.interval}
    scrapeTimeout: ${config.monitoring.serviceMonitor.scrapeTimeout}
    prometheusRelease: ${config.monitoring.serviceMonitor.prometheusRelease}` : ''}
${config.monitoring.alerts?.enabled ? `  alerts:
    enabled: true
${config.monitoring.alerts.slackWebhookUrl ? `    slackWebhookUrl: ${config.monitoring.alerts.slackWebhookUrl}` : ''}
    rules:
      diskSpaceCritical:
        enabled: ${config.monitoring.alerts.rules?.diskSpaceCritical?.enabled || true}
        threshold: ${config.monitoring.alerts.rules?.diskSpaceCritical?.threshold || 10}
        forDuration: ${config.monitoring.alerts.rules?.diskSpaceCritical?.forDuration || '5m'}
      diskSpaceWarning:
        enabled: ${config.monitoring.alerts.rules?.diskSpaceWarning?.enabled || true}
        threshold: ${config.monitoring.alerts.rules?.diskSpaceWarning?.threshold || 20}
        forDuration: ${config.monitoring.alerts.rules?.diskSpaceWarning?.forDuration || '10m'}
      highMemoryUsage:
        enabled: ${config.monitoring.alerts.rules?.highMemoryUsage?.enabled || true}
        threshold: ${config.monitoring.alerts.rules?.highMemoryUsage?.threshold || 80}
        forDuration: ${config.monitoring.alerts.rules?.highMemoryUsage?.forDuration || '10m'}
      txPoolOverload:
        enabled: ${config.monitoring.alerts.rules?.txPoolOverload?.enabled || true}
        threshold: ${config.monitoring.alerts.rules?.txPoolOverload?.threshold || 5000}
        forDuration: ${config.monitoring.alerts.rules?.txPoolOverload?.forDuration || '5m'}
      txPoolNearCapacity:
        enabled: ${config.monitoring.alerts.rules?.txPoolNearCapacity?.enabled || true}
        threshold: ${config.monitoring.alerts.rules?.txPoolNearCapacity?.threshold || 8000}
        forDuration: ${config.monitoring.alerts.rules?.txPoolNearCapacity?.forDuration || '2m'}
      highCPUUsage:
        enabled: ${config.monitoring.alerts.rules?.highCPUUsage?.enabled || true}
        threshold: ${config.monitoring.alerts.rules?.highCPUUsage?.threshold || 80}
        forDuration: ${config.monitoring.alerts.rules?.highCPUUsage?.forDuration || '10m'}
      highIOWait:
        enabled: ${config.monitoring.alerts.rules?.highIOWait?.enabled || true}
        threshold: ${config.monitoring.alerts.rules?.highIOWait?.threshold || 20}
        forDuration: ${config.monitoring.alerts.rules?.highIOWait?.forDuration || '10m'}
      predictDiskFull:
        enabled: ${config.monitoring.alerts.rules?.predictDiskFull?.enabled || true}
        predictHours: ${config.monitoring.alerts.rules?.predictDiskFull?.predictHours || 4}
        forDuration: ${config.monitoring.alerts.rules?.predictDiskFull?.forDuration || '5m'}` : ''}` : ''}

${config.livenessProbe ? `livenessProbe:
  enabled: ${config.livenessProbe.enabled}
  initialDelaySeconds: ${config.livenessProbe.initialDelaySeconds}
  periodSeconds: ${config.livenessProbe.periodSeconds}
  timeoutSeconds: ${config.livenessProbe.timeoutSeconds}
  failureThreshold: ${config.livenessProbe.failureThreshold}` : ''}

${config.readinessProbe ? `readinessProbe:
  enabled: ${config.readinessProbe.enabled}
  initialDelaySeconds: ${config.readinessProbe.initialDelaySeconds}
  periodSeconds: ${config.readinessProbe.periodSeconds}
  timeoutSeconds: ${config.readinessProbe.timeoutSeconds}
  failureThreshold: ${config.readinessProbe.failureThreshold}` : ''}
`;

  // Templates
  files['templates/statefulset.yaml'] = generateArbStatefulSetYaml(config);
  files['templates/service.yaml'] = generateServiceYaml();

  // Monitoring
  if (config.monitoring?.enabled) {
    if (config.monitoring.prometheusOperator) {
      files['templates/servicemonitor.yaml'] = generateServiceMonitorYaml('arbitrum');
      files['templates/prometheusrule.yaml'] = generatePrometheusRuleYaml('arbitrum', 'Arbitrum');
    }
    if (config.monitoring.grafanaDashboard) {
      files['templates/grafana-dashboard.yaml'] = generateGrafanaDashboardConfigMap('arbitrum', 'Arbitrum');
    }
  }

  return files;
}
