import { Router } from 'express';
import archiver from 'archiver';
import { BscConfigSchema } from '../types/bscConfig';
import { EthConfigSchema } from '../types/ethConfig';
import { ArbConfigSchema, DEFAULT_ARB_CONFIG } from '../types/arbConfig';
import {
  generateChartYaml as generateBscChartYaml,
  generateValuesYaml as generateBscValuesYaml,
  generateStatefulSetYaml as generateBscStatefulSetYaml,
  generateServiceYaml as generateBscServiceYaml,
  generateConfigMapYaml as generateBscConfigMapYaml,
} from '../generators/bscChartGenerator';
import {
  generateEthChartYaml,
  generateEthValuesYaml,
  generateEthStatefulSetYaml,
  generateEthServiceYaml,
  generateEthConfigMapYaml,
} from '../generators/ethChartGenerator';
import { generateArbHelmChart } from '../generators/arbChartGenerator';
import {
  generateServiceMonitorYaml,
  generatePrometheusRuleYaml,
  generateGrafanaDashboardConfigMap,
} from '../generators/monitoringGenerator';

export const generateChartRouter = Router();

generateChartRouter.post('/generate/bsc', async (req, res) => {
  try {
    // Validate request body
    const config = BscConfigSchema.parse(req.body);
    const deploymentName = config.deploymentName;

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `attachment; filename="bsc-node-${deploymentName}.tgz"`);

    // Create archive
    const archive = archiver('tar', {
      gzip: true,
      gzipOptions: { level: 9 },
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);

    // Add files to the archive
    const chartName = 'bsc-node';

    archive.append(generateBscChartYaml(), { name: `${chartName}/Chart.yaml` });
    archive.append(generateBscValuesYaml(config, deploymentName), {
      name: `${chartName}/${deploymentName}/values-${deploymentName}.yaml`
    });
    archive.append(generateBscStatefulSetYaml(), { name: `${chartName}/templates/statefulset.yaml` });
    archive.append(generateBscServiceYaml(), { name: `${chartName}/templates/service.yaml` });
    archive.append(generateBscConfigMapYaml(), { name: `${chartName}/templates/configmap.yaml` });

    // Add monitoring templates if enabled
    if (config.monitoring?.enabled) {
      archive.append(generateServiceMonitorYaml('bsc'), { name: `${chartName}/templates/servicemonitor.yaml` });
      archive.append(generatePrometheusRuleYaml('bsc', 'BSC'), { name: `${chartName}/templates/prometheusrule.yaml` });
      if (config.monitoring.grafanaDashboard) {
        archive.append(generateGrafanaDashboardConfigMap('bsc', 'BSC'), { name: `${chartName}/templates/grafana-dashboard.yaml` });
      }
    }

    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    console.error('Error generating chart:', error);

    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      res.status(400).json({
        error: 'Invalid configuration',
        details: error
      });
    } else {
      res.status(500).json({
        error: 'Failed to generate chart',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// Ethereum chart generation
generateChartRouter.post('/generate/eth', async (req, res) => {
  try {
    // Validate request body
    const config = EthConfigSchema.parse(req.body);
    const deploymentName = config.deploymentName;

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `attachment; filename="ethereum-node-${deploymentName}.tgz"`);

    // Create archive
    const archive = archiver('tar', {
      gzip: true,
      gzipOptions: { level: 9 },
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);

    // Add files to the archive
    const chartName = 'ethereum-node';

    archive.append(generateEthChartYaml(), { name: `${chartName}/Chart.yaml` });
    archive.append(generateEthValuesYaml(config, deploymentName), {
      name: `${chartName}/${deploymentName}/values-${deploymentName}.yaml`
    });
    archive.append(generateEthStatefulSetYaml(), { name: `${chartName}/templates/statefulset.yaml` });
    archive.append(generateEthServiceYaml(), { name: `${chartName}/templates/service.yaml` });
    archive.append(generateEthConfigMapYaml(), { name: `${chartName}/templates/configmap.yaml` });

    // Add monitoring templates if enabled
    if (config.monitoring?.enabled) {
      archive.append(generateServiceMonitorYaml('ethereum'), { name: `${chartName}/templates/servicemonitor.yaml` });
      archive.append(generatePrometheusRuleYaml('ethereum', 'Ethereum'), { name: `${chartName}/templates/prometheusrule.yaml` });
      if (config.monitoring.grafanaDashboard) {
        archive.append(generateGrafanaDashboardConfigMap('ethereum', 'Ethereum'), { name: `${chartName}/templates/grafana-dashboard.yaml` });
      }
    }

    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    console.error('Error generating chart:', error);

    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      res.status(400).json({
        error: 'Invalid configuration',
        details: error
      });
    } else {
      res.status(500).json({
        error: 'Failed to generate chart',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// Endpoint to get BSC node type presets
generateChartRouter.get('/presets/bsc/:nodeType', (req, res) => {
  const { NODE_PRESETS } = require('../presets/nodePresets');
  const nodeType = req.params.nodeType;

  if (!NODE_PRESETS[nodeType]) {
    return res.status(404).json({ error: 'Node type not found' });
  }

  res.json(NODE_PRESETS[nodeType]);
});

// Endpoint to get Ethereum node type presets
generateChartRouter.get('/presets/eth/:nodeType', (req, res) => {
  const { ETH_NODE_PRESETS } = require('../presets/ethPresets');
  const nodeType = req.params.nodeType;

  if (!ETH_NODE_PRESETS[nodeType]) {
    return res.status(404).json({ error: 'Node type not found' });
  }

  res.json(ETH_NODE_PRESETS[nodeType]);
});

// Endpoint to get default config
generateChartRouter.get('/defaults/bsc', (req, res) => {
  const defaults = {
    deploymentName: 'production',
    nodeName: 'bsc-fast-node',
    nodeType: 'fast',
    namespace: 'default',
    image: {
      repository: 'ghcr.io/bnb-chain/bsc',
      tag: 'v1.4.17',
      pullPolicy: 'IfNotPresent',
    },
    service: {
      type: 'ClusterIP',
      ports: {
        http: { port: 8545 },
        ws: { port: 8546 },
        metrics: { port: 6060 },
        p2p: { port: 30311 },
      },
    },
    config: {
      cache: 16384,
      triesVerifyMode: 'local',
      gcMode: 'full',
      historyTransactions: 0,
      rpcAllowUnprotectedTxs: true,
      syncMode: 'snap',
      ipcDisable: true,
      verbosity: 3,
      httpApi: 'eth,net,web3,txpool,parlia',
      wsApi: 'eth,net,web3',
      httpVirtualHosts: '*',
      httpCorsOrigins: '*',
      txpool: {
        globalslots: 20000,
        globalqueue: 10000,
        accountslots: 16,
        accountqueue: 64,
        lifetime: '3h0m0s',
      },
    },
    resources: {
      requests: {
        cpu: '8',
        memory: '64Gi',
      },
    },
    persistence: {
      enabled: true,
      storageClass: 'local-path',
      size: '3Ti',
    },
    livenessProbe: {
      enabled: true,
      initialDelaySeconds: 300,
      periodSeconds: 30,
      timeoutSeconds: 10,
      failureThreshold: 3,
    },
    readinessProbe: {
      enabled: true,
      initialDelaySeconds: 120,
      periodSeconds: 30,
      timeoutSeconds: 10,
      failureThreshold: 3,
    },
  };

  res.json(defaults);
});

// Endpoint to get default Ethereum config
generateChartRouter.get('/defaults/eth', (req, res) => {
  const defaults = {
    deploymentName: 'production',
    nodeName: 'eth-node',
    nodeType: 'full',
    namespace: 'default',
    image: {
      repository: 'ethereum/client-go',
      tag: 'v1.14.12',
      pullPolicy: 'IfNotPresent',
    },
    service: {
      type: 'ClusterIP',
      ports: {
        http: { port: 8545 },
        ws: { port: 8546 },
        metrics: { port: 6060 },
        p2p: { port: 30303 },
      },
    },
    config: {
      syncMode: 'snap',
      gcMode: 'full',
      stateScheme: 'path',
      cache: 16384,
      cacheDatabase: 50,
      cacheGc: 25,
      cacheSnapshot: 10,
      snapshot: true,
      historyState: 90000,
      historyTransactions: 2350000,
      verbosity: 3,
      httpApi: 'eth,net,web3',
      wsApi: 'eth,net,web3',
      httpVirtualHosts: '*',
      httpCorsOrigins: '*',
      authrpcEnabled: false,
      authrpcPort: 8551,
      authrpcVhosts: 'localhost',
      metricsEnabled: true,
      metricsInfluxdb: false,
      networkId: 1,
      txpool: {
        accountslots: 16,
        globalslots: 5120,
        accountqueue: 64,
        globalqueue: 1024,
        lifetime: '3h0m0s',
      },
      exitWhenSynced: false,
      datadirMinFreeDisk: 4096,
    },
    networking: {
      maxPeers: 50,
      nodeDiscovery: true,
      nat: 'any',
    },
    resources: {
      requests: {
        cpu: '16',
        memory: '64Gi',
      },
    },
    persistence: {
      enabled: true,
      storageClass: 'local-path',
      size: '2Ti',
    },
    livenessProbe: {
      enabled: true,
      initialDelaySeconds: 300,
      periodSeconds: 30,
      timeoutSeconds: 10,
      failureThreshold: 3,
    },
    readinessProbe: {
      enabled: true,
      initialDelaySeconds: 120,
      periodSeconds: 30,
      timeoutSeconds: 10,
      failureThreshold: 3,
    },
  };

  res.json(defaults);
});

// Arbitrum chart generation
generateChartRouter.post('/generate/arb', async (req, res) => {
  try {
    const config = ArbConfigSchema.parse(req.body);
    const deploymentName = config.deploymentName;

    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `attachment; filename="arbitrum-node-${deploymentName}.tgz"`);

    const archive = archiver('tar', {
      gzip: true,
      gzipOptions: { level: 9 },
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);

    const chartName = 'arbitrum-node';
    const files = generateArbHelmChart(config);

    for (const [filePath, content] of Object.entries(files)) {
      archive.append(content, { name: `${chartName}/${filePath}` });
    }

    await archive.finalize();
  } catch (error) {
    console.error('Error generating Arbitrum chart:', error);

    if (error instanceof Error && 'issues' in error) {
      res.status(400).json({
        error: 'Invalid configuration',
        details: error
      });
    } else {
      res.status(500).json({
        error: 'Failed to generate chart',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// Endpoint to get Arbitrum node type presets
generateChartRouter.get('/presets/arb/:nodeType', (req, res) => {
  const { ARB_NODE_PRESETS } = require('../presets/arbPresets');
  const nodeType = req.params.nodeType;

  if (!ARB_NODE_PRESETS[nodeType]) {
    return res.status(404).json({ error: 'Node type not found' });
  }

  res.json(ARB_NODE_PRESETS[nodeType]);
});

// Endpoint to get default Arbitrum config
generateChartRouter.get('/defaults/arb', (req, res) => {
  res.json(DEFAULT_ARB_CONFIG);
});
