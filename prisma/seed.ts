import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Seed Users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@inventory.com' },
      update: {},
      create: {
        username: 'admin',
        full_name: 'System Administrator',
        email: 'admin@inventory.com',
        is_active: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'manager@inventory.com' },
      update: {},
      create: {
        username: 'manager',
        full_name: 'Inventory Manager',
        email: 'manager@inventory.com',
        is_active: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'tech@inventory.com' },
      update: {},
      create: {
        username: 'technician',
        full_name: 'Lab Technician',
        email: 'tech@inventory.com',
        is_active: true,
      },
    }),
  ])

  console.log(`✅ Created ${users.length} users`)

  // Seed Cabinets
  const cabinets = await Promise.all([
    prisma.cabinet.upsert({
      where: { id: 1 },
      update: {},
      create: {
        label: 'CAB-001',
        location: 'Lab Room A',
        slots_wide: 10,
        slots_tall: 8,
      },
    }),
    prisma.cabinet.upsert({
      where: { id: 2 },
      update: {},
      create: {
        label: 'CAB-002',
        location: 'Storage Room B',
        slots_wide: 12,
        slots_tall: 6,
      },
    }),
    prisma.cabinet.upsert({
      where: { id: 3 },
      update: {},
      create: {
        label: 'CAB-003',
        location: 'Main Laboratory',
        slots_wide: 8,
        slots_tall: 10,
      },
    }),
  ])

  console.log(`✅ Created ${cabinets.length} cabinets`)

  // Seed Items
  const items = await Promise.all([
    prisma.item.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Beaker Set',
        type: 'Glassware',
        unit_weight: 250.5,
        description: 'Standard laboratory beakers, various sizes',
      },
    }),
    prisma.item.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Digital Scale',
        type: 'Equipment',
        unit_weight: 2500.0,
        description: 'High precision digital scale 0.01g accuracy',
      },
    }),
    prisma.item.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Chemical Reagent A',
        type: 'Chemical',
        unit_weight: 500.0,
        description: 'Standard laboratory reagent for testing',
      },
    }),
    prisma.item.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: 'Test Tubes',
        type: 'Glassware',
        unit_weight: 15.5,
        description: 'Borosilicate glass test tubes 15ml',
      },
    }),
    prisma.item.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: 'Safety Goggles',
        type: 'Safety Equipment',
        unit_weight: 85.0,
        description: 'Anti-fog safety goggles with adjustable strap',
      },
    }),
  ])

  console.log(`✅ Created ${items.length} items`)

  // Seed Drawers with Items
  const drawers = await Promise.all([
    prisma.drawer.upsert({
      where: { id: 1 },
      update: {},
      create: {
        cabinet_id: cabinets[0].id,
        label: 'A1-Top',
        item_id: items[0].id, // Beaker Set
        quantity: 5,
        nfc_tag: 'NFC001',
        qr_code: 'QR001',
        slot_x: 1,
        slot_y: 1,
      },
    }),
    prisma.drawer.upsert({
      where: { id: 2 },
      update: {},
      create: {
        cabinet_id: cabinets[0].id,
        label: 'A2-Middle',
        item_id: items[3].id, // Test Tubes
        quantity: 50,
        nfc_tag: 'NFC002',
        qr_code: 'QR002',
        slot_x: 2,
        slot_y: 1,
      },
    }),
    prisma.drawer.upsert({
      where: { id: 3 },
      update: {},
      create: {
        cabinet_id: cabinets[1].id,
        label: 'B1-Equipment',
        item_id: items[1].id, // Digital Scale
        quantity: 1,
        nfc_tag: 'NFC003',
        qr_code: 'QR003',
        slot_x: 1,
        slot_y: 1,
      },
    }),
    prisma.drawer.upsert({
      where: { id: 4 },
      update: {},
      create: {
        cabinet_id: cabinets[1].id,
        label: 'B2-Chemicals',
        item_id: items[2].id, // Chemical Reagent A
        quantity: 10,
        nfc_tag: 'NFC004',
        qr_code: 'QR004',
        slot_x: 2,
        slot_y: 1,
      },
    }),
    prisma.drawer.upsert({
      where: { id: 5 },
      update: {},
      create: {
        cabinet_id: cabinets[2].id,
        label: 'C1-Safety',
        item_id: items[4].id, // Safety Goggles
        quantity: 8,
        nfc_tag: 'NFC005',
        qr_code: 'QR005',
        slot_x: 1,
        slot_y: 1,
      },
    }),
  ])

  console.log(`✅ Created ${drawers.length} drawers`)

  // Seed Activity Logs
  const activityLogs = await Promise.all([
    prisma.activity_log.create({
      data: {
        user_id: users[0].id,
        action: 'ITEM_ADDED',
        drawer_id: drawers[0].id,
        details: 'Added 5 beaker sets to drawer A1-Top',
      },
    }),
    prisma.activity_log.create({
      data: {
        user_id: users[1].id,
        action: 'INVENTORY_CHECK',
        drawer_id: drawers[1].id,
        details: 'Verified test tube count in drawer A2-Middle',
      },
    }),
    prisma.activity_log.create({
      data: {
        user_id: users[2].id,
        action: 'ITEM_REMOVED',
        drawer_id: drawers[2].id,
        details: 'Removed digital scale for calibration',
      },
    }),
  ])

  console.log(`✅ Created ${activityLogs.length} activity logs`)

  // Seed Weight Logs
  const weightLogs = await Promise.all([
    prisma.weight_log.create({
      data: {
        drawer_id: drawers[0].id,
        measured_weight: 1252.5,
        note: 'Initial weight measurement after setup',
      },
    }),
    prisma.weight_log.create({
      data: {
        drawer_id: drawers[1].id,
        measured_weight: 775.0,
        note: 'Weight check after inventory count',
      },
    }),
    prisma.weight_log.create({
      data: {
        drawer_id: drawers[3].id,
        measured_weight: 5000.0,
        note: 'Chemical storage weight verification',
      },
    }),
  ])

  console.log(`✅ Created ${weightLogs.length} weight logs`)

  // Seed Alerts
  const alerts = await Promise.all([
    prisma.alert.create({
      data: {
        drawer_id: drawers[1].id,
        alert_type: 'LOW_STOCK',
        severity: 'MEDIUM',
        message: 'Test tube inventory is running low (5 remaining)',
        resolved: false,
      },
    }),
    prisma.alert.create({
      data: {
        drawer_id: drawers[2].id,
        alert_type: 'WEIGHT_MISMATCH',
        severity: 'HIGH',
        message: 'Measured weight does not match expected weight',
        resolved: false,
      },
    }),
    prisma.alert.create({
      data: {
        drawer_id: drawers[0].id,
        alert_type: 'MAINTENANCE_DUE',
        severity: 'LOW',
        message: 'Drawer cleaning scheduled for next week',
        resolved: true,
      },
    }),
  ])

  console.log(`✅ Created ${alerts.length} alerts`)

  console.log('🎉 Database seeding completed successfully!')
  
  // Print summary
  console.log('\n📊 Seeding Summary:')
  console.log(`   Users: ${users.length}`)
  console.log(`   Cabinets: ${cabinets.length}`)
  console.log(`   Items: ${items.length}`)
  console.log(`   Drawers: ${drawers.length}`)
  console.log(`   Activity Logs: ${activityLogs.length}`)
  console.log(`   Weight Logs: ${weightLogs.length}`)
  console.log(`   Alerts: ${alerts.length}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })