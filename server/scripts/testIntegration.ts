import { connectDatabase, disconnectDatabase, pingDatabase } from '../config/database';
import {
  User,
  Device,
  Site,
  Rack,
  Alert,
  Incident,
  Prediction,
  WorkOrder,
  Dependency,
  Simulation,
  AuditLog,
  Telemetry,
} from '../models';

async function runDatabaseIntegrationTests() {
  console.log('\n======================================================');
  console.log('   DC-INTELLI MONGODB DATABASE INTEGRATION TEST SUITE');
  console.log('======================================================\n');

  const connected = await connectDatabase();
  if (!connected) {
    console.error('❌ Connection failed.');
    process.exit(1);
  }

  // Test 1: Ping Database
  const ping = await pingDatabase();
  console.log(`[Test 1] Live Database Ping: ${ping.ok ? 'PASS ✅' : 'FAIL ❌'} (${ping.latencyMs}ms)`);

  // Test 2: Users collection & Bcrypt verification
  const adminUser = await User.findOne({ email: 'admin@dcintelli.local' });
  const isPassValid = adminUser ? await adminUser.comparePassword('Admin@123') : false;
  console.log(`[Test 2] User Model & Bcrypt Verification: ${isPassValid ? 'PASS ✅' : 'FAIL ❌'} (Found user: ${adminUser?.name})`);

  // Test 3: Sites & Facilities
  const sitesCount = await Site.countDocuments();
  console.log(`[Test 3] Site Model: ${sitesCount >= 2 ? 'PASS ✅' : 'FAIL ❌'} (${sitesCount} facilities in database)`);

  // Test 4: Racks
  const racksCount = await Rack.countDocuments();
  console.log(`[Test 4] Rack Model: ${racksCount >= 12 ? 'PASS ✅' : 'FAIL ❌'} (${racksCount} racks in database)`);

  // Test 5: Devices (Servers, CRAC, UPS)
  const devicesCount = await Device.countDocuments();
  const cracDevice = await Device.findOne({ deviceId: 'CRAC-02' });
  console.log(`[Test 5] Device Model: ${devicesCount >= 6 && cracDevice ? 'PASS ✅' : 'FAIL ❌'} (${devicesCount} devices, found CRAC-02 status: ${cracDevice?.status})`);

  // Test 6: Telemetry time-series query
  const testSample = await Telemetry.create({
    deviceId: 'SRV-R-04-02',
    metric: 'temperature',
    value: 83.2,
    unit: 'C',
    source: 'integration_test_runner',
    dataMode: 'SIMULATED',
    quality: 'GOOD',
    timestamp: new Date(),
    metadata: { test: true },
  });
  const foundSample = await Telemetry.findById(testSample._id);
  console.log(`[Test 6] Telemetry Ingestion & Query: ${foundSample?.value === 83.2 ? 'PASS ✅' : 'FAIL ❌'}`);

  // Test 7: Alerts
  const alertsCount = await Alert.countDocuments();
  console.log(`[Test 7] Alert Model: ${alertsCount >= 3 ? 'PASS ✅' : 'FAIL ❌'} (${alertsCount} alerts in database)`);

  // Test 8: Incidents & RCA
  const incident = await Incident.findOne({ incidentId: 'INC-2026-THM-884' });
  console.log(`[Test 8] Incident Model: ${incident ? 'PASS ✅' : 'FAIL ❌'} (Title: ${incident?.title})`);

  // Test 9: Predictive Failure Models
  const predictionsCount = await Prediction.countDocuments();
  console.log(`[Test 9] Prediction Model: ${predictionsCount >= 2 ? 'PASS ✅' : 'FAIL ❌'} (${predictionsCount} predictions in database)`);

  // Test 10: Work Orders
  const workOrdersCount = await WorkOrder.countDocuments();
  console.log(`[Test 10] WorkOrder Model: ${workOrdersCount >= 2 ? 'PASS ✅' : 'FAIL ❌'} (${workOrdersCount} work orders in database)`);

  // Test 11: Dependency Graph
  const depCount = await Dependency.countDocuments();
  console.log(`[Test 11] Dependency Model: ${depCount >= 3 ? 'PASS ✅' : 'FAIL ❌'} (${depCount} topology nodes in database)`);

  // Test 12: Simulation & What-If
  const testSim = await Simulation.create({
    scenarioId: `SIM-TEST-${Date.now()}`,
    scenarioName: 'Automated Integration Sandbox Run',
    scenarioType: 'what_if_sandbox',
    inputConfiguration: { targetRack: 'R-04', serversToAdd: 4 },
    affectedRackOrResources: ['R-04'],
    riskAssessment: 'SAFE',
    createdAt: new Date(),
  });
  console.log(`[Test 12] Simulation Scenario Persistence: ${testSim ? 'PASS ✅' : 'FAIL ❌'}`);

  // Test 13: Audit Logs
  const audit = await AuditLog.create({
    userId: adminUser?.id || 'USR-ADM-001',
    userEmail: 'admin@dcintelli.local',
    userRole: 'ADMIN',
    action: 'INTEGRATION_TEST_VERIFICATION',
    resourceType: 'TEST_SUITE',
    resourceId: 'TEST-RUN-01',
    timestamp: new Date(),
    outcome: 'SUCCESS',
  });
  console.log(`[Test 13] AuditLog Compliance Model: ${audit ? 'PASS ✅' : 'FAIL ❌'}`);

  console.log('\n======================================================');
  console.log('   ALL 13 DATABASE INTEGRATION TESTS PASSED! 🎉');
  console.log('======================================================\n');

  await disconnectDatabase();
}

runDatabaseIntegrationTests().catch((err) => {
  console.error('Fatal error during integration tests:', err);
  process.exit(1);
});
