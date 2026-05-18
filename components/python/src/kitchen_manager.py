import asyncio
from typing import Any, Set

from fastapi import WebSocket


class KitchenManager:
    def __init__(self):
        self._clients: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def register(self, ws: WebSocket) -> None:
        async with self._lock:
            self._clients.add(ws)

    async def unregister(self, ws: WebSocket) -> None:
        async with self._lock:
            self._clients.discard(ws)

    async def broadcast(self, message: dict[str, Any]) -> None:
        dead: set[WebSocket] = set()
        async with self._lock:
            for ws in self._clients:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.add(ws)
            for ws in dead:
                self._clients.discard(ws)


kitchen_manager = KitchenManager()
