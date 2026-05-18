<script lang="ts">
  import { onMount } from "svelte";
  import {
    Header,
    Controls,
    PipelineCard,
    CartPanel,
    ActivityFeed,
    Console,
    VoiceExperience,
  } from "./lib/components";
  import { createVoiceSession } from "./lib/websocket";
  import KitchenDisplay from "./lib/kitchen/KitchenDisplay.svelte";

  const voiceSession = createVoiceSession();

  let pathname = $state("/");
  let isDev = $state(false);

  onMount(() => {
    const sync = (): void => {
      pathname = window.location.pathname;
      isDev = window.location.hash === "#/dev";
    };
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  });
</script>

{#if pathname === "/kitchen"}
  <KitchenDisplay />
{:else if isDev}
  <div class="max-w-3xl mx-auto px-4 py-8">
    <Header />
    <Controls
      onStart={() => voiceSession.start()}
      onStop={() => voiceSession.stop()}
    />
    <CartPanel />
    <PipelineCard />
    <ActivityFeed />
    <Console />
    <p class="mt-8 text-center text-sm">
      <a
        class="text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-gray-800"
        href="#/"
      >
        ← Voice experience
      </a>
    </p>
  </div>
{:else}
  <VoiceExperience
    onStart={() => voiceSession.start()}
    onStop={() => voiceSession.stop()}
  />
{/if}
