import { EthConfig } from '../types/ethConfig';
import yaml from 'js-yaml';
import {
  generateChartYaml,
  generateServiceYaml,
  generateSnapshotInitContainer,
  generateVolumeMounts,
  generateVolumes,
  generateVolumeClaimTemplates,
  generateGethLivenessProbe,
  generateGethReadinessProbe,
  generateGethPorts,
  generateStatefulSetMetadata,
  generateStatefulSetSpec,
} from './commonGenerators';

export function generateEthChartYaml(): string {
  return generateChartYaml('ethereum', 'Ethereum Geth Node ');
}

export function generateEthValuesYaml(config: EthConfig, deploymentName: string): string {
  const values: any = {
    replicaCount: 1,
    nodeType: config.nodeType,
    nodeName: config.nodeName,
    namespace: config.namespace || 'default',
    chain: 'ethereum',
    image: config.image,
    service: config.service,
    config: config.config,
    resources: config.resources,
    persistence: config.persistence,
    livenessProbe: config.livenessProbe,
    readinessProbe: config.readinessProbe,
  };

  // Add networking if provided
  if (config.networking) {
    values.networking = config.networking;
  }

  // Add snapshot if enabled
  if (config.snapshot?.enabled) {
    values.snapshot = config.snapshot;
  }

  // Add monitoring if enabled
  if (config.monitoring?.enabled) {
    values.monitoring = {
      ...config.monitoring,
      // Ensure alerts.rules exists with default values if alerts are enabled
      alerts: config.monitoring.alerts?.enabled ? {
        ...config.monitoring.alerts,
        rules: config.monitoring.alerts.rules || {
          diskSpaceCritical: { enabled: true, threshold: 10, forDuration: '5m' },
          diskSpaceWarning: { enabled: true, threshold: 20, forDuration: '10m' },
          highMemoryUsage: { enabled: true, threshold: 80, forDuration: '10m' },
          txPoolOverload: { enabled: true, threshold: 5000, forDuration: '5m' },
          txPoolNearCapacity: { enabled: true, threshold: 8000, forDuration: '2m' },
          highCPUUsage: { enabled: true, threshold: 80, forDuration: '10m' },
          highIOWait: { enabled: true, threshold: 20, forDuration: '10m' },
          predictDiskFull: { enabled: true, predictHours: 4, forDuration: '5m' },
        }
      } : config.monitoring.alerts,
    };
  }

  // Add validator if enabled
  if (config.validator?.enabled) {
    values.validator = config.validator;
  }

  return `# Ethereum ${config.nodeType.charAt(0).toUpperCase() + config.nodeType.slice(1)} Node Configuration - ${deploymentName}\n${yaml.dump(values)}`;
}

export function generateEthStatefulSetYaml(): string {
  return `${generateStatefulSetMetadata('ethereum')}
${generateStatefulSetSpec()}
        chain: ethereum
    spec:
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- if .Values.securityContext }}
      securityContext:
        {{- if eq .Values.securityContext.apparmor "unconfined" }}
        appArmorProfile:
          type: Unconfined
        {{- end }}
      {{- end }}
${generateSnapshotInitContainer('/data')}
      containers:
      - name: geth
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        command:
          - geth
          - --datadir=/data
          - --http
          - --http.addr=0.0.0.0
          - --http.port={{ .Values.service.ports.http.port }}
          - --http.api={{ .Values.config.httpApi }}
          - --http.vhosts={{ .Values.config.httpVirtualHosts }}
          - --http.corsdomain={{ .Values.config.httpCorsOrigins }}
          - --ws
          - --ws.addr=0.0.0.0
          - --ws.port={{ .Values.service.ports.ws.port }}
          - --ws.api={{ .Values.config.wsApi }}
          - --ws.origins={{ .Values.config.httpCorsOrigins }}
          {{- if .Values.config.authrpcEnabled }}
          - --authrpc.addr=0.0.0.0
          - --authrpc.port={{ .Values.config.authrpcPort }}
          - --authrpc.vhosts={{ .Values.config.authrpcVhosts }}
          {{- end }}
          - --syncmode={{ .Values.config.syncMode }}
          - --gcmode={{ .Values.config.gcMode }}
          - --state.scheme={{ .Values.config.stateScheme }}
          - --cache={{ .Values.config.cache }}
          - --cache.database={{ .Values.config.cacheDatabase }}
          - --cache.gc={{ .Values.config.cacheGc }}
          - --cache.snapshot={{ .Values.config.cacheSnapshot }}
          {{- if .Values.config.snapshot }}
          - --snapshot
          {{- end }}
          - --history.state={{ .Values.config.historyState }}
          - --history.transactions={{ .Values.config.historyTransactions }}
          {{- if .Values.networking }}
          - --maxpeers={{ .Values.networking.maxPeers }}
          {{- if .Values.networking.bootnodes }}
          - --bootnodes={{ .Values.networking.bootnodes }}
          {{- end }}
          - --nat={{ .Values.networking.nat }}
          {{- if not .Values.networking.nodeDiscovery }}
          - --nodiscover
          {{- end }}
          {{- end }}
          {{- if .Values.config.metricsEnabled }}
          - --metrics
          - --metrics.addr=0.0.0.0
          - --metrics.port={{ .Values.service.ports.metrics.port }}
          {{- if .Values.config.metricsInfluxdb }}
          - --metrics.influxdb
          {{- end }}
          {{- end }}
          - --pprof
          - --pprof.addr=0.0.0.0
          - --pprof.port={{ .Values.service.ports.metrics.port }}
          - --verbosity={{ .Values.config.verbosity }}
          {{- if .Values.config.txpool }}
          - --txpool.accountslots={{ .Values.config.txpool.accountslots }}
          - --txpool.globalslots={{ .Values.config.txpool.globalslots }}
          - --txpool.accountqueue={{ .Values.config.txpool.accountqueue }}
          - --txpool.globalqueue={{ .Values.config.txpool.globalqueue }}
          - --txpool.lifetime={{ .Values.config.txpool.lifetime }}
          {{- end }}
          {{- if .Values.config.exitWhenSynced }}
          - --exitwhensynced
          {{- end }}
          - --datadir.minfreedisk={{ .Values.config.datadirMinFreeDisk }}
          - --networkid={{ .Values.config.networkId }}
${generateGethPorts()}
${generateGethLivenessProbe()}
${generateGethReadinessProbe()}
        resources:
          {{- toYaml .Values.resources | nindent 10 }}
${generateVolumeMounts('/data', '/config')}
        {{- with .Values.env }}
        env:
          {{- toYaml . | nindent 10 }}
        {{- end }}
      {{- if and .Values.monitoring .Values.monitoring.enabled .Values.monitoring.gethExporter.enabled }}
      # Geth Exporter Sidecar - Exposes Prometheus metrics from RPC
      - name: geth-exporter
        image: "{{ .Values.monitoring.gethExporter.image.repository }}:{{ .Values.monitoring.gethExporter.image.tag }}"
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
${generateVolumes('{{ .Values.nodeName }}-config')}
${generateVolumeClaimTemplates()}
`;
}

export function generateEthServiceYaml(): string {
  return generateServiceYaml();
}

export function generateEthConfigMapYaml(): string {
  return `apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Values.nodeName }}-config
  namespace: {{ .Values.namespace | default "default" }}
  labels:
    app: {{ .Values.nodeName }}
    chain: ethereum
data:
  config.toml: |
    # Ethereum Geth configuration
    # This file is kept for compatibility but most settings are passed via CLI flags
    [Node]
    DataDir = "/data"
    IPCPath = "geth.ipc"
    HTTPHost = "0.0.0.0"
    HTTPPort = {{ .Values.service.ports.http.port }}
    HTTPVirtualHosts = ["{{ .Values.config.httpVirtualHosts }}"]
    HTTPModules = [{{ range $i, $module := (split "," .Values.config.httpApi) }}{{if $i}}, {{end}}"{{$module}}"{{end}}]

    WSHost = "0.0.0.0"
    WSPort = {{ .Values.service.ports.ws.port }}
    WSOrigins = ["{{ .Values.config.httpCorsOrigins }}"]
    WSModules = [{{ range $i, $module := (split "," .Values.config.wsApi) }}{{if $i}}, {{end}}"{{$module}}"{{end}}]

    [Node.P2P]
    MaxPeers = {{ if .Values.networking }}{{ .Values.networking.maxPeers | default 50 }}{{ else }}50{{ end }}
    NoDiscovery = {{ if .Values.networking }}{{ if .Values.networking.nodeDiscovery }}false{{ else }}true{{ end }}{{ else }}false{{ end }}
    ListenAddr = ":{{ .Values.service.ports.p2p.port }}"

    [Node.HTTPTimeouts]
    ReadTimeout = 30000000000
    WriteTimeout = 30000000000
    IdleTimeout = 120000000000

    [Eth]
    SyncMode = "{{ .Values.config.syncMode }}"
    NetworkId = {{ .Values.config.networkId }}

    {{- if .Values.config.txpool }}
    [Eth.TxPool]
    Locals = []
    NoLocals = true
    Journal = "transactions.rlp"
    Rejournal = 3600000000000
    PriceLimit = 1
    PriceBump = 10
    AccountSlots = {{ .Values.config.txpool.accountslots }}
    GlobalSlots = {{ .Values.config.txpool.globalslots }}
    AccountQueue = {{ .Values.config.txpool.accountqueue }}
    GlobalQueue = {{ .Values.config.txpool.globalqueue }}
    Lifetime = {{ .Values.config.txpool.lifetime }}
    {{- end }}
`;
}
