export function createVoiceSession() {
  return {
    start() {
      console.log("Voice session started");
    },
    stop() {
      console.log("Voice session stopped");
    },
  };
}
