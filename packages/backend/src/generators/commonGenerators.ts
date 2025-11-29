import yaml from 'js-yaml';
import { BaseChainConfig } from '../types/common';

/**
 * Generate Chart.yaml for any blockchain
 */
export function generateChartYaml(chainName: string, description: string): string {
  const chart = {
    apiVersion: 'v2',
    name: `${chainName.toLowerCase()}-node`,
    description,
    type: 'application',
    version: '1.0.0',
    appVersion: 'latest',
    keywords: ['blockchain', chainName.toLowerCase()],
    maintainers: [{ name: 'Boba Node Team' }],
  };

  return yaml.dump(chart);
}

/**
 * Generate Service YAML template (common for all chains)
 */
export function generateServiceYaml(): string {
  return `apiVersion: v1
kind: Service
metadata:
  name: {{ .Values.nodeName }}
  namespace: {{ .Values.namespace | default "default" }}
  labels:
    app: {{ .Values.nodeName }}
    {{- if .Values.chain }}
    chain: {{ .Values.chain }}
    {{- end }}
spec:
  type: {{ .Values.service.type }}
  selector:
    app: {{ .Values.nodeName }}
  ports:
  - name: http
    port: {{ .Values.service.ports.http.port }}
    targetPort: http
    protocol: TCP
    {{- if .Values.service.ports.http.hostPort }}
    hostPort: {{ .Values.service.ports.http.hostPort }}
    {{- end }}
  - name: ws
    port: {{ .Values.service.ports.ws.port }}
    targetPort: ws
    protocol: TCP
    {{- if .Values.service.ports.ws.hostPort }}
    hostPort: {{ .Values.service.ports.ws.hostPort }}
    {{- end }}
  - name: metrics
    port: {{ .Values.service.ports.metrics.port }}
    targetPort: metrics
    protocol: TCP
    {{- if .Values.service.ports.metrics.hostPort }}
    hostPort: {{ .Values.service.ports.metrics.hostPort }}
    {{- end }}
  - name: p2p
    port: {{ .Values.service.ports.p2p.port }}
    targetPort: p2p
    protocol: TCP
    {{- if .Values.service.ports.p2p.hostPort }}
    hostPort: {{ .Values.service.ports.p2p.hostPort }}
    {{- end }}
  - name: p2p-udp
    port: {{ .Values.service.ports.p2p.port }}
    targetPort: p2p-udp
    protocol: UDP
    {{- if .Values.service.ports.p2p.hostPort }}
    hostPort: {{ .Values.service.ports.p2p.hostPort }}
    {{- end }}
  {{- if and .Values.monitoring .Values.monitoring.enabled .Values.monitoring.gethExporter.enabled }}
  - name: geth-exporter
    port: {{ .Values.monitoring.gethExporter.port }}
    targetPort: exporter
    protocol: TCP
  {{- end }}
`;
}

/**
 * Generate snapshot init container script (common pattern)
 */
export function generateSnapshotInitContainer(dataPath: string = '/data'): string {
  return `      {{- if and .Values.snapshot .Values.snapshot.enabled }}
      initContainers:
      - name: download-snapshot
        image: busybox:latest
        command:
        - sh
        - -c
        - |
          if [ ! -f ${dataPath}/geth/chaindata/CURRENT ]; then
            echo "Downloading snapshot from {{ .Values.snapshot.url }}"
            wget -O /tmp/snapshot.tar.gz {{ .Values.snapshot.url }}
            {{- if .Values.snapshot.checksum }}
            echo "{{ .Values.snapshot.checksum }}  /tmp/snapshot.tar.gz" | sha256sum -c -
            {{- end }}
            echo "Extracting snapshot..."
            tar -xzf /tmp/snapshot.tar.gz -C ${dataPath}
            rm /tmp/snapshot.tar.gz
            echo "Snapshot extraction complete"
          else
            echo "Chaindata already exists, skipping snapshot download"
          fi
        volumeMounts:
        - name: data
          mountPath: ${dataPath}
      {{- end }}`;
}

/**
 * Generate common volume mounts
 */
export function generateVolumeMounts(dataPath: string = '/data', configPath: string = '/config'): string {
  return `        volumeMounts:
        - name: data
          mountPath: ${dataPath}
        - name: config
          mountPath: ${configPath}
          readOnly: true`;
}

/**
 * Generate common volumes section
 */
export function generateVolumes(configMapName: string = '{{ .Values.nodeName }}-config'): string {
  return `      volumes:
      - name: config
        configMap:
          name: ${configMapName}
      {{- if not .Values.persistence.enabled }}
      - name: data
        hostPath:
          path: {{ .Values.persistence.hostPath }}
          type: DirectoryOrCreate
      {{- end }}`;
}

/**
 * Generate volume claim templates
 */
export function generateVolumeClaimTemplates(): string {
  return `  {{- if .Values.persistence.enabled }}
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: {{ .Values.persistence.storageClass }}
      resources:
        requests:
          storage: {{ .Values.persistence.size }}
  {{- end }}`;
}

/**
 * Generate common health probes for Geth-based chains
 */
export function generateGethLivenessProbe(metricsPort: number = 6060): string {
  return `        {{- if .Values.livenessProbe.enabled }}
        livenessProbe:
          httpGet:
            path: /debug/metrics
            port: metrics
          initialDelaySeconds: {{ .Values.livenessProbe.initialDelaySeconds }}
          periodSeconds: {{ .Values.livenessProbe.periodSeconds }}
          timeoutSeconds: {{ .Values.livenessProbe.timeoutSeconds }}
          failureThreshold: {{ .Values.livenessProbe.failureThreshold }}
        {{- end }}`;
}

export function generateGethReadinessProbe(httpPort: number = 8545): string {
  return `        {{- if .Values.readinessProbe.enabled }}
        readinessProbe:
          exec:
            command:
            - sh
            - -c
            - "curl -sf -X POST -H 'Content-Type: application/json' --data '{\\\\\"jsonrpc\\\\\":\\\\\"2.0\\\\\",\\\\\"method\\\\\":\\\\\"eth_blockNumber\\\\\",\\\\\"params\\\\\":[],\\\\\"id\\\\\":1}' http://localhost:{{ .Values.service.ports.http.port }} || exit 1"
          initialDelaySeconds: {{ .Values.readinessProbe.initialDelaySeconds }}
          periodSeconds: {{ .Values.readinessProbe.periodSeconds }}
          timeoutSeconds: {{ .Values.readinessProbe.timeoutSeconds }}
          failureThreshold: {{ .Values.readinessProbe.failureThreshold }}
        {{- end }}`;
}

/**
 * Generate common port definitions for Geth-based chains
 */
export function generateGethPorts(): string {
  return `        ports:
        - name: http
          containerPort: {{ .Values.service.ports.http.port }}
          {{- if .Values.service.ports.http.hostPort }}
          hostPort: {{ .Values.service.ports.http.hostPort }}
          {{- end }}
          protocol: TCP
        - name: ws
          containerPort: {{ .Values.service.ports.ws.port }}
          {{- if .Values.service.ports.ws.hostPort }}
          hostPort: {{ .Values.service.ports.ws.hostPort }}
          {{- end }}
          protocol: TCP
        - name: metrics
          containerPort: {{ .Values.service.ports.metrics.port }}
          {{- if .Values.service.ports.metrics.hostPort }}
          hostPort: {{ .Values.service.ports.metrics.hostPort }}
          {{- end }}
          protocol: TCP
        - name: p2p
          containerPort: {{ .Values.service.ports.p2p.port }}
          {{- if .Values.service.ports.p2p.hostPort }}
          hostPort: {{ .Values.service.ports.p2p.hostPort }}
          {{- end }}
          protocol: TCP
        - name: p2p-udp
          containerPort: {{ .Values.service.ports.p2p.port }}
          {{- if .Values.service.ports.p2p.hostPort }}
          hostPort: {{ .Values.service.ports.p2p.hostPort }}
          {{- end }}
          protocol: UDP`;
}

/**
 * Generate StatefulSet metadata
 */
export function generateStatefulSetMetadata(chainLabel?: string): string {
  return `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: {{ .Values.nodeName }}
  namespace: {{ .Values.namespace | default "default" }}
  labels:
    app: {{ .Values.nodeName }}${chainLabel ? `\n    chain: ${chainLabel}` : ''}`;
}

/**
 * Generate StatefulSet spec header
 */
export function generateStatefulSetSpec(): string {
  return `spec:
  serviceName: {{ .Values.nodeName }}
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Values.nodeName }}
  template:
    metadata:
      labels:
        app: {{ .Values.nodeName }}`;
}
