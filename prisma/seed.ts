// prisma/seed.ts - Prisma Seed Script
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.create({
    data: {
      username: 'admin',
      full_name: 'System Administrator',
      email: 'admin@ordobin.com',
      password: hashedPassword,
      is_active: true
    }
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'operator',
      full_name: 'Warehouse Operator',
      email: 'operator@ordobin.com',
      password: hashedPassword,
      is_active: true
    }
  });

  console.log('✅ Users created');

  // Create Items
  const screwsM6 = await prisma.item.create({
    data: {
      name: 'Screws M6x20',
      type: 'Fastener',
      unit_weight: 0.5,
      description: 'Stainless steel hex screws M6x20mm'
    }
  });

  const washers6mm = await prisma.item.create({
    data: {
      name: 'Washers 6mm',
      type: 'Fastener',
      unit_weight: 0.2,
      description: 'Stainless steel flat washers 6mm'
    }
  });

  const boltsM8 = await prisma.item.create({
    data: {
      name: 'Bolts M8x30',
      type: 'Fastener',
      unit_weight: 1.0,
      description: 'Stainless steel hex bolts M8x30mm'
    }
  });

  const nutsM8 = await prisma.item.create({
    data: {
      name: 'Nuts M8',
      type: 'Fastener',
      unit_weight: 0.5,
      description: 'Stainless steel hex nuts M8'
    }
  });

  const resistors = await prisma.item.create({
    data: {
      name: 'Resistors 1kΩ',
      type: 'Electronic',
      unit_weight: 0.1,
      description: '1/4W Carbon Film Resistors 1kΩ'
    }
  });

  const capacitors = await prisma.item.create({
    data: {
      name: 'Capacitors 100µF',
      type: 'Electronic',
      unit_weight: 0.8,
      description: 'Electrolytic Capacitors 100µF 25V'
    }
  });

  console.log('✅ Items created');

  // Create Cabinets
  const cabinet1 = await prisma.cabinet.create({
    data: {
      label: 'CAB-001',
      location: 'Workshop A - Wall 1',
      slots_wide: 4,
      slots_tall: 3
    }
  });

  const cabinet2 = await prisma.cabinet.create({
    data: {
      label: 'CAB-002',
      location: 'Workshop A - Wall 2',
      slots_wide: 4,
      slots_tall: 3
    }
  });

  const cabinet3 = await prisma.cabinet.create({
    data: {
      label: 'CAB-003',
      location: 'Electronics Lab',
      slots_wide: 6,
      slots_tall: 4
    }
  });

  console.log('✅ Cabinets created');

  // Create Drawers with realistic data
  const drawers = [
    // Cabinet 1 - Fasteners
    {
      cabinet_id: cabinet1.id,
      label: 'Drawer 1-1',
      item_id: screwsM6.id,
      quantity: 284,
      nfc_tag: 'NFC_001_001',
      qr_code: 'QR_CAB001_01',
      slot_x: 1,
      slot_y: 1
    },
    {
      cabinet_id: cabinet1.id,
      label: 'Drawer 1-2',
      item_id: washers6mm.id,
      quantity: 390,
      nfc_tag: 'NFC_001_002',
      qr_code: 'QR_CAB001_02',
      slot_x: 2,
      slot_y: 1
    },
    {
      cabinet_id: cabinet1.id,
      label: 'Drawer 1-3',
      item_id: boltsM8.id,
      quantity: 45, // Low stock
      nfc_tag: 'NFC_001_003',
      qr_code: 'QR_CAB001_03',
      slot_x: 3,
      slot_y: 1
    },
    {
      cabinet_id: cabinet1.id,
      label: 'Drawer 1-4',
      item_id: nutsM8.id,
      quantity: 236,
      nfc_tag: 'NFC_001_004',
      qr_code: 'QR_CAB001_04',
      slot_x: 4,
      slot_y: 1
    },
    // Cabinet 2 - More Fasteners
    {
      cabinet_id: cabinet2.id,
      label: 'Drawer 2-1',
      item_id: screwsM6.id,
      quantity: 156,
      nfc_tag: 'NFC_002_001',
      qr_code: 'QR_CAB002_01',
      slot_x: 1,
      slot_y: 1
    },
    {
      cabinet_id: cabinet2.id,
      label: 'Drawer 2-2',
      item_id: washers6mm.id,
      quantity: 8, // Critical stock
      nfc_tag: 'NFC_002_002',
      qr_code: 'QR_CAB002_02',
      slot_x: 2,
      slot_y: 1
    },
    // Cabinet 3 - Electronics
    {
      cabinet_id: cabinet3.id,
      label: 'Drawer 3-1',
      item_id: resistors.id,
      quantity: 2450,
      nfc_tag: 'NFC_003_001',
      qr_code: 'QR_CAB003_01',
      slot_x: 1,
      slot_y: 1
    },
    {
      cabinet_id: cabinet3.id,
      label: 'Drawer 3-2',
      item_id: capacitors.id,
      quantity: 78,
      nfc_tag: 'NFC_003_002',
      qr_code: 'QR_CAB003_02',
      slot_x: 2,
      slot_y: 1
    }
  ];

  const createdDrawers = [];
  for (const drawerData of drawers) {
    const drawer = await prisma.drawer.create({
      data: drawerData
    });
    createdDrawers.push(drawer);
  }

  console.log('✅ Drawers created');

  // Create Weight Logs (historical data)
  const now = new Date();
  const weightLogs = [];

  for (const drawer of createdDrawers) {
    const item = await prisma.item.findUnique({ where: { id: drawer.item_id! } });
    if (!item) continue;

    const expectedWeight = drawer.quantity! * item.unit_weight!;
    
    // Create weight logs for the past 7 days
    for (let i = 0; i < 7; i++) {
      const logDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const variation = (Math.random() - 0.5) * expectedWeight * 0.1; // ±10% variation
      const measuredWeight = Math.max(0, expectedWeight + variation);

      weightLogs.push({
        drawer_id: drawer.id,
        timestamp: logDate,
        measured_weight: Math.round(measuredWeight * 100) / 100,
        note: i === 0 ? 'Latest reading' : `Auto-reading ${i} days ago`
      });
    }
  }

  await prisma.weightLog.createMany({
    data: weightLogs
  });

  console.log('✅ Weight logs created');

  // Create Activity Logs
  const activities = [
    {
      user_id: user1.id,
      action: 'refill',
      drawer_id: createdDrawers[0].id,
      details: { previous_quantity: 200, new_quantity: 284, refill_amount: 84 },
      timestamp: new Date(now.getTime() - 30 * 60 * 1000) // 30 minutes ago
    },
    {
      user_id: user2.id,
      action: 'weight_check',
      drawer_id: createdDrawers[1].id,
      details: { expected_weight: 78, measured_weight: 75.2, discrepancy: 2.8 },
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      user_id: user1.id,
      action: 'calibration',
      drawer_id: createdDrawers[2].id,
      details: { calibration_type: 'sensor_zero', status: 'completed' },
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000) // 4 hours ago
    },
    {
      user_id: user2.id,
      action: 'alert_generated',
      drawer_id: createdDrawers[5].id, // Critical stock drawer
      details: { alert_type: 'critical_stock', threshold: 10, current_quantity: 8 },
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000) // 6 hours ago
    }
  ];

  await prisma.activityLog.createMany({
    data: activities
  });

  console.log('✅ Activity logs created');

  // Create Alerts
  const alerts = [
    {
      drawer_id: createdDrawers[2].id, // Low stock bolt drawer
      alert_type: 'low_stock',
      severity: 'warning',
      message: 'Stock level below 25% threshold',
      resolved: false
    },
    {
      drawer_id: createdDrawers[5].id, // Critical stock washer drawer
      alert_type: 'critical_stock',
      severity: 'error',
      message: 'Critical stock level - immediate refill required',
      resolved: false
    },
    {
      drawer_id: createdDrawers[1].id,
      alert_type: 'weight_discrepancy',
      severity: 'warning',
      message: 'Weight measurement differs from expected value',
      resolved: true
    }
  ];

  await prisma.alert.createMany({
    data: alerts
  });

  console.log('✅ Alerts created');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: ${await prisma.user.count()}`);
  console.log(`- Items: ${await prisma.item.count()}`);
  console.log(`- Cabinets: ${await prisma.cabinet.count()}`);
  console.log(`- Drawers: ${await prisma.drawer.count()}`);
  console.log(`- Weight Logs: ${await prisma.weightLog.count()}`);
  console.log(`- Activity Logs: ${await prisma.activityLog.count()}`);
  console.log(`- Alerts: ${await prisma.alert.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// package.json script to add:
// "scripts": {
//   "db:seed": "tsx prisma/seed.ts"
// }

// Run with: npm run db:seed