import { Client, StompSubscription } from '@stomp/stompjs';
import { ClaimEvent, ConnectionStatus } from '../types/claim';

class WebSocketService {
  private client: Client | null = null;
  private connectionStatus: ConnectionStatus = 'DISCONNECTED';
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private isConnecting: boolean = false;

  private getBrokerUrl(): string {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    // Convert http:// to ws:// and https:// to wss://
    const wsBase = apiBase.replace(/^http/, 'ws');
    return `${wsBase}/ws-claims`;
  }

  public connect(): void {
    if (this.client && (this.client.active || this.isConnecting)) {
      return;
    }

    this.updateStatus('CONNECTING');
    this.isConnecting = true;

    try {
      this.client = new Client({
        brokerURL: this.getBrokerUrl(),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: () => {
          // Keep console clean
        },
        onConnect: () => {
          this.isConnecting = false;
          this.updateStatus('CONNECTED');
        },
        onDisconnect: () => {
          this.isConnecting = false;
          this.updateStatus('DISCONNECTED');
        },
        onStompError: () => {
          this.isConnecting = false;
          this.updateStatus('DISCONNECTED');
        },
        onWebSocketError: () => {
          this.isConnecting = false;
          this.updateStatus('DISCONNECTED');
        },
        onWebSocketClose: () => {
          this.isConnecting = false;
          this.updateStatus('DISCONNECTED');
        }
      });

      this.client.activate();
    } catch {
      this.isConnecting = false;
      this.updateStatus('DISCONNECTED');
    }
  }

  public disconnect(): void {
    if (this.client) {
      try {
        this.client.deactivate();
      } catch {
        // Ignored
      }
      this.client = null;
    }
    this.isConnecting = false;
    this.updateStatus('DISCONNECTED');
  }

  public getStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.connectionStatus);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private updateStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.statusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch {
        // Ignored
      }
    });
  }

  /**
   * Subscribes to events for a specific claim: /topic/claims/{claimId}
   */
  public subscribeToClaim(
    claimId: number,
    callback: (event: ClaimEvent) => void
  ): () => void {
    this.connect();

    let subscription: StompSubscription | null = null;

    const setupSubscription = () => {
      try {
        if (this.client && this.client.connected) {
          subscription = this.client.subscribe(`/topic/claims/${claimId}`, (message) => {
            try {
              const event: ClaimEvent = JSON.parse(message.body);
              callback(event);
            } catch {
              // Malformed event body ignored
            }
          });
        }
      } catch {
        // Subscription error suppressed to prevent application crash
      }
    };

    if (this.client?.connected) {
      setupSubscription();
    }

    // Also re-subscribe whenever reconnect occurs
    const unsubscribeStatus = this.onStatusChange((status) => {
      if (status === 'CONNECTED' && (!subscription || subscription.id === '')) {
        setupSubscription();
      }
    });

    return () => {
      unsubscribeStatus();
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch {
          // Ignored
        }
      }
    };
  }

  /**
   * Subscribes to all global claim events: /topic/claims
   */
  public subscribeToAllClaims(callback: (event: ClaimEvent) => void): () => void {
    this.connect();

    let subscription: StompSubscription | null = null;

    const setupSubscription = () => {
      try {
        if (this.client && this.client.connected) {
          subscription = this.client.subscribe('/topic/claims', (message) => {
            try {
              const event: ClaimEvent = JSON.parse(message.body);
              callback(event);
            } catch {
              // Malformed event body ignored
            }
          });
        }
      } catch {
        // Subscription error suppressed to prevent application crash
      }
    };

    if (this.client?.connected) {
      setupSubscription();
    }

    const unsubscribeStatus = this.onStatusChange((status) => {
      if (status === 'CONNECTED' && (!subscription || subscription.id === '')) {
        setupSubscription();
      }
    });

    return () => {
      unsubscribeStatus();
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch {
          // Ignored
        }
      }
    };
  }
}

export const websocketService = new WebSocketService();
