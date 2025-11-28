import { Router } from 'express';
import archiver from 'archiver';
import { BscConfigSchema } from '../types/bscConfig';
import {
  generateChartYaml,
  generateValuesYaml,
  generateStatefulSetYaml,
  generateServiceYaml,
  generateConfigMapYaml,
} from '../generators/bscChartGenerator';

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

    archive.append(generateChartYaml(), { name: `${chartName}/Chart.yaml` });
    archive.append(generateValuesYaml(config, deploymentName), {
      name: `${chartName}/${deploymentName}/values-${deploymentName}.yaml`
    });
    archive.append(generateStatefulSetYaml(), { name: `${chartName}/templates/statefulset.yaml` });
    archive.append(generateServiceYaml(), { name: `${chartName}/templates/service.yaml` });
    archive.append(generateConfigMapYaml(), { name: `${chartName}/templates/configmap.yaml` });

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

// Endpoint to get default config
generateChartRouter.get('/defaults/bsc', (req, res) => {
  const defaults = {
    deploymentName: 'production',
    nodeName: 'bsc-fast-node',
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
      historyTransactions: 0,
      rpcAllowUnprotectedTxs: true,
      syncMode: 'snap',
      ipcDisable: true,
      verbosity: 3,
      httpApi: 'eth,net,web3,txpool,parlia',
      wsApi: 'eth,net,web3',
      txpool: {
        globalslots: 20000,
        globalqueue: 10000,
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
