import type { WSContext } from "hono/ws";
import type WebSocket from "ws";

export interface KitchenOrder {
  id: string;
  items: {
    product_id: string;
    name: string;
    quantity: number;
    unit_price_cents: number;
  }[];
  total_cents: number;
  status: "nuevo" | "en preparación" | "listo";
  created_at: string;
}

export type KitchenServerEvent =
  | { type: "new_order"; order: KitchenOrder }
  | {
      type: "status_updated";
      orderId: string;
      status: KitchenOrder["status"];
    }
  | { type: "orders_snapshot"; orders: KitchenOrder[] };

export type KitchenClientEvent = {
  type: "update_status";
  orderId: string;
  status: KitchenOrder["status"];
};

export class KitchenManager {
  private clients = new Set<WSContext<WebSocket>>();
  private orders = new Map<string, KitchenOrder>();

  register(ws: WSContext<WebSocket>): void {
    this.clients.add(ws);
    this.sendToClient(ws, {
      type: "orders_snapshot",
      orders: Array.from(this.orders.values()),
    });
  }

  unregister(ws: WSContext<WebSocket>): void {
    this.clients.delete(ws);
  }

  addOrder(order: KitchenOrder): void {
    this.orders.set(order.id, order);
    this.broadcast({ type: "new_order", order });
  }

  updateStatus(
    orderId: string,
    status: KitchenOrder["status"]
  ): boolean {
    const order = this.orders.get(orderId);
    if (!order) return false;
    order.status = status;
    this.broadcast({ type: "status_updated", orderId, status });
    return true;
  }

  getOrders(): KitchenOrder[] {
    return Array.from(this.orders.values());
  }

  broadcast(event: KitchenServerEvent): void {
    const msg = JSON.stringify(event);
    for (const ws of this.clients) {
      try {
        ws.send(msg);
      } catch {
        this.clients.delete(ws);
      }
    }
  }

  private sendToClient(
    ws: WSContext<WebSocket>,
    event: KitchenServerEvent
  ): void {
    try {
      ws.send(JSON.stringify(event));
    } catch {
      this.clients.delete(ws);
    }
  }
}

export const kitchenManager = new KitchenManager();
