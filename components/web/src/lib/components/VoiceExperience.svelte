<script lang="ts">
  let { onStart, onStop }: { onStart: () => void; onStop: () => void } = $props();
</script>

<div class="flex flex-col items-center justify-center min-h-screen p-8">
  <div class="text-center mb-8">
    <h1 class="text-4xl font-bold text-gray-800 mb-2">Voice Sandwich</h1>
    <p class="text-gray-500">Presiona Iniciar y habla para ordenar</p>
  </div>
  <button
    onclick={onStart}
    class="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 text-white text-3xl shadow-lg flex items-center justify-center"
  >
    🎤
  </button>
  <button
    onclick={onStop}
    class="mt-4 px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
  >
    Detener
  </button>
  <a href="/kitchen" class="mt-8 text-sm text-gray-400 underline underline-offset-2 hover:text-gray-600">
    🍳 Pantalla de cocina
  </a>
</div>
