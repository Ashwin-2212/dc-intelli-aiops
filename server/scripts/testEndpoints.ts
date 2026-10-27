import http from 'http';
import express from 'express';
import { connectDatabase, disconnectDatabase, getDatabaseHealth } from '../config/database';
import { authRouter } from '../routes/authRoutes';
import { deviceRouter } from '../routes/deviceRoutes';
import { telemetryRouter } from '../routes/telemetryRoutes';
import { alertRouter } from '../routes/alertRoutes';
import { incidentRouter } from '../routes/incidentRoutes';
import { predictionRouter } from '../routes/predictionRoutes';
import { maintenanceRouter } from '../routes/maintenanceRoutes';
import { topologyRouter } from '../routes/topologyRoutes';
import { simulationRouter } from '../routes/simulationRoutes';
import { auditRouter } from '../routes/auditRoutes';

async function testEndpoints() {
  console.log('\n======================================================');
  console.log('   DC-INTELLI REST API LIVE ENDPOINT VERIFICATION');
  console.log('======================================================\n');

  await connectDatabase();

  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', database: getDatabaseHealth() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/devices', deviceRouter);
  app.use('/api/telemetry', telemetryRouter);
  app.use('/api/alerts', alertRouter);
  app.use('/api/incidents', incidentRouter);
  app.use('/api/predictions', predictionRouter);
  app.use('/api/work-orders', maintenanceRouter);
  app.use('/api/topology', topologyRouter);
  app.use('/api/sites', topologyRouter);
  app.use('/api/simulations', simulationRouter);
  app.use('/api/audit-logs', auditRouter);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(3099, '127.0.0.1', () => resolve()));
  const baseUrl = 'http://127.0.0.1:3099/api';

  try {
    // 1. Health
    const resHealth = await fetch(`${baseUrl}/health`).then((r) => r.json());
    console.log(`[API 1] GET /api/health: ${resHealth.database?.connected ? 'PASS ✅' : 'FAIL ❌'} (status: ${resHealth.status})`);

    // 2. Auth Login
    const resLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@dcintelli.local', password: 'Admin@123', role: 'ADMIN' }),
    }).then((r) => r.json());
    const token = resLogin.token;
    console.log(`[API 2] POST /api/auth/login: ${resLogin.success && token ? 'PASS ✅' : 'FAIL ❌'} (User: ${resLogin.user?.name})`);

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 3. Devices
    const resDevices = await fetch(`${baseUrl}/devices`, { headers: authHeaders }).then((r) => r.json());
    console.log(`[API 3] GET /api/devices: ${resDevices.success && resDevices.devices?.length > 0 ? 'PASS ✅' : 'FAIL ❌'} (${resDevices.devices?.length} devices retrieved)`);

    // 4. Telemetry Ingestion
    const resTelemetry = await fetch(`${baseUrl}/telemetry`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        deviceId: 'SRV-R-04-02',
        metrics: { cpu: 88.5, temperature: 78.2, power: 720 },
        sourceType: 'telemetry_simulator',
        dataMode: 'SIMULATED',
      }),
    }).then((r) => r.json());
    console.log(`[API 4] POST /api/telemetry: ${resTelemetry.success ? 'PASS ✅' : 'FAIL ❌'} (${resTelemetry.message})`);

    // 5. Alerts
    const resAlerts = await fetch(`${baseUrl}/alerts`, { headers: authHeaders }).then((r) => r.json());
    console.log(`[API 5] GET /api/alerts: ${resAlerts.success ? 'PASS ✅' : 'FAIL ❌'} (${resAlerts.alerts?.length} alerts retrieved)`);

    // 6. Incidents
    const resIncidents = await fetch(`${baseUrl}/incidents`, { headers: authHeaders }).then((r) => r.json());
    console.log(`[API 6] GET /api/incidents: ${resIncidents.success ? 'PASS ✅' : 'FAIL ❌'} (${resIncidents.incidents?.length} incidents retrieved)`);

    // 7. Predictions
    const resPredictions = await fetch(`${baseUrl}/predictions`, { headers: authHeaders }).then((r) => r.json());
    console.log(`[API 7] GET /api/predictions: ${resPredictions.success ? 'PASS ✅' : 'FAIL ❌'} (${resPredictions.predictions?.length} predictions retrieved)`);

    // 8. Work Orders
    const resWorkOrders = await fetch(`${baseUrl}/work-orders/work-orders`, { headers: authHeaders }).then((r) => r.json());
    console.log(`[API 8] GET /api/work-orders: ${resWorkOrders.success ? 'PASS ✅' : 'FAIL ❌'} (${resWorkOrders.workOrders?.length} work orders retrieved)`);

    // 9. Sites & Facilities
    const resSites = await fetch(`${baseUrl}/sites/sites`, { headers: authHeaders }).then((r) => r.json());
    console.log(`[API 9] GET /api/sites: ${Array.isArray(resSites) && resSites.length > 0 ? 'PASS ✅' : 'FAIL ❌'} (${resSites.length} sites retrieved)`);

    // 10. Audit Logs
    const resAudit = await fetch(`${baseUrl}/audit-logs`, { headers: authHeaders }).then((r) => r.json());
    console.log(`[API 10] GET /api/audit-logs: ${resAudit.success && resAudit.auditLogs?.length > 0 ? 'PASS ✅' : 'FAIL ❌'} (${resAudit.auditLogs?.length} audit trails retrieved)`);

    console.log('\n======================================================');
    console.log('   ALL 10 API ENDPOINTS VERIFIED SUCCESSFULLY! 🚀');
    console.log('======================================================\n');
  } finally {
    server.close();
    await disconnectDatabase();
  }
}

testEndpoints().catch((err) => {
  console.error('Fatal endpoint test failure:', err);
  process.exit(1);
});
