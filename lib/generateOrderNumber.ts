import { prisma } from "@/lib/prisma";

export async function generateSequentialOrderNumber(date = new Date()): Promise<string> {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const prefix = `${yy}${mm}${dd}`;

  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

  const todayOrders = await prisma.vendorOrder.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: {
      orderNumber: true,
    },
  });

  let maxSequence = 0;

  for (const order of todayOrders) {
    const value = String(order.orderNumber || "").trim();
    const match = value.match(new RegExp(`^${prefix}-(\\d{4})$`));

    if (!match) continue;

    const sequence = Number(match[1]);
    if (!Number.isNaN(sequence) && sequence > maxSequence) {
      maxSequence = sequence;
    }
  }

  const nextSequence = String(maxSequence + 1).padStart(4, "0");
  return `${prefix}-${nextSequence}`;
}