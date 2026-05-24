// src/hooks/useQueueSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { QueueUpdateEvent } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:8080/ws';

interface UseQueueSocketOptions {
  shopId: string;
  onUpdate: (event: QueueUpdateEvent) => void;
  onConnect?: () => void;
}

interface SocketState {
  connected: boolean;
  error: string | null;
}

/**
 * Hook that connects to the QueueLess WebSocket broker and subscribes
 * to a shop's queue topic for real-time updates.
 *
 * Reconnects automatically on disconnect with exponential backoff.
 */
export function useQueueSocket(options: UseQueueSocketOptions): SocketState {
  const [state, setState] = useState<SocketState>({ connected: false, error: null });
  const clientRef = useRef<Client | null>(null);
  const onUpdateRef = useRef(options.onUpdate);
  onUpdateRef.current = options.onUpdate;
  
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        setState({ connected: true, error: null });
        
        // Trigger a refetch if provided to resync state after connection drops
        optionsRef.current.onConnect?.();

        client.subscribe(`/topic/queue/${options.shopId}`, (message: IMessage) => {
          try {
            const event: QueueUpdateEvent = JSON.parse(message.body);
            onUpdateRef.current(event);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        });
      },

      onDisconnect: () => {
        setState((s) => ({ ...s, connected: false }));
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setState({ connected: false, error: 'Connection error. Reconnecting…' });
      },
    });

    client.activate();
    clientRef.current = client;
  }, [options.shopId]);

  useEffect(() => {
    connect();
    return () => {
      clientRef.current?.deactivate();
    };
  }, [connect]);

  return state;
}