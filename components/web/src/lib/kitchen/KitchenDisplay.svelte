<script lang="ts">
  import { onMount } from "svelte";
  import { kitchenStore, type KitchenOrder, type KitchenStatus } from "./kitchenStore.svelte";

  const COLORS: Record<KitchenStatus, { bg: string; border: string; badge: string }> = {
    "nuevo": { bg: "bg-yellow-50", border: "border-yellow-400", badge: "bg-yellow-500" },
    "en preparación": { bg: "bg-blue-50", border: "border-blue-400", badge: "bg-blue-500" },
    "listo": { bg: "bg-green-50", border: "border-green-400", badge: "bg-green-500" },
  };

  const STATUS_LABELS: Record<KitchenStatus, string> = {
    "nuevo": "Nuevo",
    "en preparación": "En Preparación",
    "listo": "Listo",
  };

  let audioCtx: AudioContext | null = null;

  function playNotification() {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  }

  let prevCount = 0;
  $effect(() => {
    const orders = kitchenStore.orders;
    const nuevoCount = orders.filter((o) => o.status === "nuevo").length;
    if (nuevoCount > prevCount) {
      playNotification();
    }
    prevCount = nuevoCount;
  });

  onMount(() => {
    kitchenStore.connect();
    return () => kitchenStore.disconnect();
  });

  function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  }

  function formatPrice(cents: number): string {
    return `${(cents / 100).toFixed(2)} €`;
  }

  function shortId(id: string): string {
    return id.slice(0, 8);
  }

  function nextStatus(current: KitchenStatus): KitchenStatus | null {
    if (current === "nuevo") return "en preparación";
    if (current === "en preparación") return "listo";
    return null;
  }

  function nextLabel(current: KitchenStatus): string {
    if (current === "nuevo") return "Aceptar";
    if (current === "en preparación") return "Listo";
    return "";
  }

  function handleStatusChange(order: KitchenOrder) {
    const next = nextStatus(order.status);
    if (next) {
      kitchenStore.updateStatus(order.id, next);
    }
  }
</script>

<div class="min-h-screen bg-gray-100">
  <header class="bg-white shadow-sm border-b border-gray-200 py-3 px-6 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <span class="text-2xl">🍳</span>
      <h1 class="text-xl font-bold text-gray-800">Cocina - Voice Sandwich</h1>
    </div>
    <div class="flex items-center gap-2">
      <span class="inline-block w-2 h-2 rounded-full {kitchenStore.connected ? 'bg-green-500' : 'bg-red-500'}"></span>
      <span class="text-sm text-gray-500">{kitchenStore.connected ? 'Conectado' : 'Desconectado'}</span>
      <span class="text-sm text-gray-400 ml-4">Pedidos: {kitchenStore.orders.length}</span>
    </div>
  </header>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 max-w-7xl mx-auto">
    {#each ["nuevo", "en preparación", "listo"] as status}
      <div>
        <div class="flex items-center gap-2 mb-3">
          <span class="text-lg">
            {#if status === "nuevo"}🆕{:else if status === "en preparación"}🔄{:else}✅{/if}
          </span>
          <h2 class="font-semibold text-gray-700">{STATUS_LABELS[status]}</h2>
          <span class="text-xs text-gray-400 ml-auto">
            {kitchenStore.orders.filter((o) => o.status === status).length}
          </span>
        </div>

        <div class="space-y-3">
          {#each kitchenStore.orders.filter((o) => o.status === status) as order (order.id)}
            <div class="bg-white rounded-lg shadow border-l-4 {COLORS[status].border} p-4">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <span class="text-xs font-mono text-gray-400">#{shortId(order.id)}</span>
                </div>
                <span class="text-xs text-gray-400">{formatTime(order.created_at)}</span>
              </div>

              <ul class="space-y-1 mb-3">
                {#each order.items as item}
                  <li class="text-sm text-gray-700">
                    <span class="font-medium">{item.quantity}x</span> {item.name}
                  </li>
                {/each}
              </ul>

              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-gray-800">{formatPrice(order.total_cents)}</span>
                {#if nextStatus(status)}
                  <button
                    onclick={() => handleStatusChange(order)}
                    class="px-3 py-1.5 text-sm font-medium rounded-md text-white transition-colors {status === 'nuevo'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-blue-500 hover:bg-blue-600'}"
                  >
                    {nextLabel(status)}
                  </button>
                {:else}
                  <span class="text-xs text-green-600 font-medium">Completado</span>
                {/if}
              </div>
            </div>
          {:else}
            <div class="text-center text-gray-400 text-sm py-8 bg-white rounded-lg border border-dashed border-gray-200">
              Sin pedidos
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
