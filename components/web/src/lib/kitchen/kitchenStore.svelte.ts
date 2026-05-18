export interface KitchenOrder {
  id: string;
  items: { product_id: string; name: string; quantity: number; unit_price_cents: number }[];
  total_cents: number;
  status: "nuevo" | "en preparación" | "listo";
  created_at: string;
}

export type KitchenStatus = KitchenOrder["status"];

function createKitchenStore() {
  let ws: WebSocket | null = $state(null);
  let connected = $state(false);
  let orders = $state<KitchenOrder[]>([]);
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function connect() {
    if (ws?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const url = `${protocol}//${host}/ws/kitchen`;

    ws = new WebSocket(url);

    ws.onopen = () => {
      connected = true;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleEvent(data);
      } catch {
        // ignore invalid messages
      }
    };

    ws.onclose = () => {
      connected = false;
      ws = null;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => connect(), 3000);
    };

    ws.onerror = () => {
      ws?.close();
    };
  }

  function disconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    ws?.close();
    ws = null;
    connected = false;
  }

  function updateStatus(orderId: string, status: KitchenStatus) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "update_status", orderId, status }));
    }
  }

  function handleEvent(data: unknown) {
    const msg = data as Record<string, unknown>;
    switch (msg.type) {
      case "orders_snapshot": {
        const snapshot = msg as { type: "orders_snapshot"; orders: KitchenOrder[] };
        orders = snapshot.orders;
        break;
      }
      case "new_order": {
        const newOrder = msg as { type: "new_order"; order: KitchenOrder };
        orders = [newOrder.order, ...orders];
        break;
      }
      case "status_updated": {
        const update = msg as { type: "status_updated"; orderId: string; status: KitchenStatus };
        orders = orders.map((o) =>
          o.id === update.orderId ? { ...o, status: update.status } : o
        );
        break;
      }
    }
  }

  return {
    get connected() { return connected; },
    get orders() { return orders; },
    connect,
    disconnect,
    updateStatus,
  };
}

export const kitchenStore = createKitchenStore();
