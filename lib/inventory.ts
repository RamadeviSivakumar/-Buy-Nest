// Demo inventory is derived from saved orders in this browser.
// Clearing browser storage resets it; this is not shared server inventory.
type StockItem = { id: number; stock: number; inventoryBaseStock?: number };

export function withAvailableStock<T extends StockItem>(item: T): T & { inventoryBaseStock: number } {
  const baseline = item.inventoryBaseStock ?? item.stock;
  let sold = 0;
  if (typeof window !== "undefined") {
    const orders = JSON.parse(localStorage.getItem("buynest-orders") ?? "[]");
    if (!Array.isArray(orders)) throw new Error("Unable to read inventory orders.");
    const seen = new Set<string>();
    for (const order of orders) {
      if (!order || typeof order.orderId !== "string" || seen.has(order.orderId)) continue;
      seen.add(order.orderId);
      if (!Array.isArray(order.items)) continue;
      for (const entry of order.items) {
        if (entry?.id === item.id && Number.isInteger(entry.quantity) && entry.quantity > 0) {
          sold += entry.quantity;
        }
      }
    }
  }
  return { ...item, inventoryBaseStock: baseline, stock: Math.max(0, baseline - sold) };
}