export enum ConnectionStatus {
    DISCONNECTED = "disconnected",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    ERROR = "error"
  }
  
  export interface Change {
    username: string;
    timestamp: number;
  }