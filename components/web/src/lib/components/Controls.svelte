<script lang="ts">
  let { onStart, onStop }: { onStart: () => void; onStop: () => void } = $props();
</script>

<div class="flex gap-2 mb-4">
  <button onclick={onStart} class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
    Iniciar
  </button>
  <button onclick={onStop} class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
    Detener
  </button>
</div>
