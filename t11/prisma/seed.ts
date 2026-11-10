import { PrismaClient, Role, OrderStatus, InventoryTransactionType } from "@prisma/client";
import { MOCK_USERS } from "../mock/users";
import { MOCK_CATEGORIES } from "../mock/categories";
import { MOCK_MATERIALS } from "../mock/materials";
import { MOCK_ORDERS, MOCK_ORDER_STATUS_HISTORIES } from "../mock/orders";
import { MOCK_ORDER_MATERIALS } from "../mock/order-materials";
import { MOCK_INVENTORY_TRANSACTIONS } from "../mock/inventory";
import { MOCK_ACTIVITY_LOGS } from "../mock/activity-logs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Users
  console.log("Seeding users...");
  for (const user of MOCK_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role as Role,
        passwordHash: "$2b$10$EpRnTzVlqHNP0.fUbXUwSOyUIBiW536789abcdef", // Mock hashed pass
        isActive: user.isActive,
      },
    });
  }

  // 2. Seed Categories
  console.log("Seeding categories...");
  for (const cat of MOCK_CATEGORIES) {
    await prisma.materialCategory.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        description: cat.description,
      },
    });
  }

  // 3. Seed Materials
  console.log("Seeding materials...");
  for (const mat of MOCK_MATERIALS) {
    await prisma.material.upsert({
      where: { materialCode: mat.materialCode },
      update: {},
      create: {
        id: mat.id,
        materialCode: mat.materialCode,
        name: mat.name,
        categoryId: mat.categoryId,
        unit: mat.unit,
        quantity: mat.quantity,
        minQuantity: mat.minQuantity,
        unitPrice: mat.unitPrice,
        supplier: mat.supplier,
        description: mat.description,
      },
    });
  }

  // 4. Seed Orders
  console.log("Seeding orders...");
  for (const ord of MOCK_ORDERS) {
    await prisma.order.upsert({
      where: { orderCode: ord.orderCode },
      update: {},
      create: {
        id: ord.id,
        orderCode: ord.orderCode,
        customerName: ord.customerName,
        customerPhone: ord.customerPhone,
        customerAddress: ord.customerAddress,
        description: ord.description,
        quantity: ord.quantity,
        startDate: new Date(ord.startDate),
        expectedDate: new Date(ord.expectedDate),
        completedDate: ord.completedDate ? new Date(ord.completedDate) : null,
        status: ord.status as OrderStatus,
        assignedToId: ord.assignedToId,
        createdById: ord.createdById,
      },
    });
  }

  // 5. Seed Order Materials
  console.log("Seeding order materials...");
  for (const om of MOCK_ORDER_MATERIALS) {
    await prisma.orderMaterial.upsert({
      where: {
        orderId_materialId: {
          orderId: om.orderId,
          materialId: om.materialId,
        },
      },
      update: {},
      create: {
        id: om.id,
        orderId: om.orderId,
        materialId: om.materialId,
        quantityRequired: om.quantityRequired,
        quantityUsed: om.quantityUsed,
      },
    });
  }

  // 6. Seed Inventory Transactions
  console.log("Seeding inventory transactions...");
  for (const txn of MOCK_INVENTORY_TRANSACTIONS) {
    await prisma.inventoryTransaction.upsert({
      where: { transactionCode: txn.transactionCode },
      update: {},
      create: {
        id: txn.id,
        transactionCode: txn.transactionCode,
        materialId: txn.materialId,
        orderId: txn.orderId,
        type: txn.type as InventoryTransactionType,
        quantity: txn.quantity,
        unitPrice: txn.unitPrice,
        note: txn.note,
        performedById: txn.performedById,
        createdAt: new Date(txn.createdAt),
      },
    });
  }

  // 7. Seed Order Status History
  console.log("Seeding order status histories...");
  for (const hist of MOCK_ORDER_STATUS_HISTORIES) {
    await prisma.orderStatusHistory.upsert({
      where: { id: hist.id },
      update: {},
      create: {
        id: hist.id,
        orderId: hist.orderId,
        oldStatus: hist.oldStatus ? (hist.oldStatus as OrderStatus) : null,
        newStatus: hist.newStatus as OrderStatus,
        changedById: hist.changedById,
        note: hist.note,
        createdAt: new Date(hist.createdAt),
      },
    });
  }

  // 8. Seed Activity Logs
  console.log("Seeding activity logs...");
  for (const act of MOCK_ACTIVITY_LOGS) {
    await prisma.activityLog.upsert({
      where: { id: act.id },
      update: {},
      create: {
        id: act.id,
        userId: act.userId,
        action: act.action,
        entityType: act.entityType,
        entityId: act.entityId,
        description: act.description,
        createdAt: new Date(act.createdAt),
      },
    });
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error while seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

