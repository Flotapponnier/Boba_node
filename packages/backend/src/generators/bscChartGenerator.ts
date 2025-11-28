import { BscConfig } from '../types/bscConfig';
import yaml from 'js-yaml';

export function generateChartYaml(): string {
  const chart = {
    apiVersion: 'v2',
    name: 'bsc-node',
    description: 'Binance Smart Chain Node ',
    type: 'application',
    version: '1.0.0',
    appVersion: 'latest',
    keywords: ['blockchain', 'bsc', 'binance', 'fast-node'],
    maintainers: [{ name: 'Boba Node Team' }],
  };

  return yaml.dump(chart);
}

export function generateValuesYaml(config: BscConfig, deploymentName: string): string {
  const values: any = {
    replicaCount: 1,
    nodeType: config.nodeType,
    nodeName: config.nodeName,
    namespace: config.namespace || 'default',
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
    values.monitoring = config.monitoring;
  }

  // Add validator if enabled
  if (config.validator?.enabled) {
    values.validator = config.validator;
  }

  return `# BSC ${config.nodeType.charAt(0).toUpperCase() + config.nodeType.slice(1)} Node Configuration - ${deploymentName}\n${yaml.dump(values)}`;
}

export function generateStatefulSetYaml(): string {
  return `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: {{ .Values.nodeName }}
  namespace: {{ .Values.namespace | default "default" }}
  labels:
    app: {{ .Values.nodeName }}
    chain: bsc
spec:
  serviceName: {{ .Values.nodeName }}
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Values.nodeName }}
  template:
    metadata:
      labels:
        app: {{ .Values.nodeName }}
        chain: bsc
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
      {{- if and .Values.snapshot .Values.snapshot.enabled }}
      initContainers:
      - name: download-snapshot
        image: busybox:latest
        command:
        - sh
        - -c
        - |
          if [ ! -f /data/geth/chaindata/CURRENT ]; then
            echo "Downloading snapshot from {{ .Values.snapshot.url }}"
            wget -O /tmp/snapshot.tar.gz {{ .Values.snapshot.url }}
            {{- if .Values.snapshot.checksum }}
            echo "{{ .Values.snapshot.checksum }}  /tmp/snapshot.tar.gz" | sha256sum -c -
            {{- end }}
            echo "Extracting snapshot..."
            tar -xzf /tmp/snapshot.tar.gz -C /data
            rm /tmp/snapshot.tar.gz
            echo "Snapshot extraction complete"
          else
            echo "Chaindata already exists, skipping snapshot download"
          fi
        volumeMounts:
        - name: data
          mountPath: /data
      {{- end }}
      containers:
      - name: bsc
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        command:
          - geth
          - --config=/bsc/config/config.toml
          - --datadir=/data
          - --http
          - --http.addr=0.0.0.0
          - --http.port={{ .Values.service.ports.http.port }}
          - --http.api={{ .Values.config.httpApi }}
          - --ws
          - --ws.addr=0.0.0.0
          - --ws.port={{ .Values.service.ports.ws.port }}
          - --cache={{ .Values.config.cache }}
          - --tries-verify-mode={{ .Values.config.triesVerifyMode }}
          - --gcmode={{ .Values.config.gcMode }}
          - --history.transactions={{ .Values.config.historyTransactions }}
          {{- if .Values.config.rpcAllowUnprotectedTxs }}
          - --rpc.allow-unprotected-txs
          {{- end }}
          - --syncmode={{ .Values.config.syncMode }}
          {{- if .Values.config.ipcDisable }}
          - --ipcdisable
          {{- end }}
          - --http.vhosts={{ .Values.config.httpVirtualHosts }}
          - --http.corsdomain={{ .Values.config.httpCorsOrigins }}
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
          - --metrics
          - --metrics.addr=0.0.0.0
          - --metrics.port={{ .Values.service.ports.metrics.port }}
          - --pprof
          - --pprof.addr=0.0.0.0
          - --pprof.port={{ .Values.service.ports.metrics.port }}
          - --verbosity={{ .Values.config.verbosity }}
          {{- if .Values.config.txpool }}
          - --txpool.globalslots={{ .Values.config.txpool.globalslots }}
          - --txpool.globalqueue={{ .Values.config.txpool.globalqueue }}
          - --txpool.lifetime={{ .Values.config.txpool.lifetime }}
          {{- end }}
        ports:
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
          protocol: UDP
        {{- if .Values.livenessProbe.enabled }}
        livenessProbe:
          httpGet:
            path: /debug/metrics
            port: metrics
          initialDelaySeconds: {{ .Values.livenessProbe.initialDelaySeconds }}
          periodSeconds: {{ .Values.livenessProbe.periodSeconds }}
          timeoutSeconds: {{ .Values.livenessProbe.timeoutSeconds }}
          failureThreshold: {{ .Values.livenessProbe.failureThreshold }}
        {{- end }}
        {{- if .Values.readinessProbe.enabled }}
        readinessProbe:
          exec:
            command:
            - sh
            - -c
            - "curl -sf -X POST -H 'Content-Type: application/json' --data '{\\"jsonrpc\\":\\"2.0\\",\\"method\\":\\"eth_blockNumber\\",\\"params\\":[],\\"id\\":1}' http://localhost:{{ .Values.service.ports.http.port }} || exit 1"
          initialDelaySeconds: {{ .Values.readinessProbe.initialDelaySeconds }}
          periodSeconds: {{ .Values.readinessProbe.periodSeconds }}
          timeoutSeconds: {{ .Values.readinessProbe.timeoutSeconds }}
          failureThreshold: {{ .Values.readinessProbe.failureThreshold }}
        {{- end }}
        resources:
          {{- toYaml .Values.resources | nindent 10 }}
        volumeMounts:
        - name: data
          mountPath: /data
        - name: config
          mountPath: /bsc/config
          readOnly: true
        {{- with .Values.env }}
        env:
          {{- toYaml . | nindent 10 }}
        {{- end }}
      volumes:
      - name: config
        configMap:
          name: {{ .Values.nodeName }}-config
      {{- if not .Values.persistence.enabled }}
      - name: data
        hostPath:
          path: {{ .Values.persistence.hostPath }}
          type: DirectoryOrCreate
      {{- end }}
  {{- if .Values.persistence.enabled }}
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: {{ .Values.persistence.storageClass }}
      resources:
        requests:
          storage: {{ .Values.persistence.size }}
  {{- end }}
`;
}

export function generateServiceYaml(): string {
  return `apiVersion: v1
kind: Service
metadata:
  name: {{ .Values.nodeName }}
  namespace: {{ .Values.namespace | default "default" }}
  labels:
    app: {{ .Values.nodeName }}
    chain: bsc
spec:
  type: {{ .Values.service.type }}
  selector:
    app: {{ .Values.nodeName }}
  ports:
  - name: http
    port: {{ .Values.service.ports.http.port }}
    targetPort: http
    protocol: TCP
  - name: ws
    port: {{ .Values.service.ports.ws.port }}
    targetPort: ws
    protocol: TCP
  - name: metrics
    port: {{ .Values.service.ports.metrics.port }}
    targetPort: metrics
    protocol: TCP
  - name: p2p
    port: {{ .Values.service.ports.p2p.port }}
    targetPort: p2p
    protocol: TCP
  - name: p2p-udp
    port: {{ .Values.service.ports.p2p.port }}
    targetPort: p2p-udp
    protocol: UDP
`;
}

export function generateConfigMapYaml(): string {
  return `apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Values.nodeName }}-config
  namespace: {{ .Values.namespace | default "default" }}
  labels:
    app: {{ .Values.nodeName }}
    chain: bsc
data:
  config.toml: |
    [Eth]
    NetworkId = 56
    NoPruning = false
    NoPrefetch = false
    LightPeers = 100
    UltraLightFraction = 75
    TrieTimeout = 100000000000
    EnablePreimageRecording = false
    EWASMInterpreter = ""
    EVMInterpreter = ""

    [Eth.Miner]
    GasFloor = 30000000
    GasCeil = 40000000
    GasPrice = 3000000000
    Recommit = 10000000000
    Noverify = false

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

    [Eth.GPO]
    Blocks = 20
    Percentile = 60
    OracleThreshold = 1000

    [Node]
    IPCPath = "geth.ipc"
    HTTPHost = "0.0.0.0"
    HTTPPort = {{ .Values.service.ports.http.port }}
    HTTPVirtualHosts = ["*"]
    HTTPModules = ["{{ .Values.config.httpApi }}"]
    WSHost = "0.0.0.0"
    WSPort = {{ .Values.service.ports.ws.port }}
    WSOrigins = ["*"]
    WSModules = ["{{ .Values.config.wsApi }}"]

    [Node.P2P]
    MaxPeers = {{ if .Values.networking }}{{ .Values.networking.maxPeers | default 200 }}{{ else }}200{{ end }}
    NoDiscovery = {{ if .Values.networking }}{{ if .Values.networking.nodeDiscovery }}false{{ else }}true{{ end }}{{ else }}false{{ end }}
    ListenAddr = ":{{ .Values.service.ports.p2p.port }}"
    EnableMsgEvents = false

    [Node.HTTPTimeouts]
    ReadTimeout = 30000000000
    WriteTimeout = 30000000000
    IdleTimeout = 120000000000
`;
}
