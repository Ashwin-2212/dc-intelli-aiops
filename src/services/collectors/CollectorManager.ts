import {
  CollectorHealthStatus,
  DeviceSourceMode,
  IDataCollectorAdapter,
  NormalizedTelemetryPayload,
  ProtocolType,
} from './types';
import { RedfishAdapter } from './RedfishAdapter';
import { SNMPAdapter } from './SNMPAdapter';
import { ModbusBACnetAdapter } from './ModbusBACnetAdapter';

export type TelemetryPayloadListener = (payloads: NormalizedTelemetryPayload[]) => void;

export class CollectorManager {
  private static instance: CollectorManager;
  private adapters: Map<string, IDataCollectorAdapter> = new Map();
  private pollTimers: Map<string, any> = new Map();
  private listeners: Set<TelemetryPayloadListener> = new Set();
  private isRunning: boolean = false;
  private latestNormalizedBuffer: Map<string, NormalizedTelemetryPayload> = new Map();

  private constructor() {
    this.registerAdapter(new RedfishAdapter());
    this.registerAdapter(new SNMPAdapter());
    this.registerAdapter(new ModbusBACnetAdapter());
  }

  public static getInstance(): CollectorManager {
    if (!CollectorManager.instance) {
      CollectorManager.instance = new CollectorManager();
    }
    return CollectorManager.instance;
  }

  public registerAdapter(adapter: IDataCollectorAdapter): void {
    this.adapters.set(adapter.config.id, adapter);
  }

  public getAdapters(): IDataCollectorAdapter[] {
    return Array.from(this.adapters.values());
  }

  public getAdapter(id: string): IDataCollectorAdapter | undefined {
    return this.adapters.get(id);
  }

  public getHealthStatuses(): CollectorHealthStatus[] {
    return Array.from(this.adapters.values()).map(a => a.getHealthStatus());
  }

  public setSourceModeForAll(mode: DeviceSourceMode): void {
    for (const adapter of this.adapters.values()) {
      adapter.setSourceMode(mode);
    }
  }

  public setSourceModeForAdapter(id: string, mode: DeviceSourceMode): void {
    const adapter = this.adapters.get(id);
    if (adapter) {
      adapter.setSourceMode(mode);
    }
  }

  public subscribe(listener: TelemetryPayloadListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    for (const [id, adapter] of this.adapters.entries()) {
      await adapter.init();
      this.startAdapterLoop(id, adapter);
    }
  }

  private startAdapterLoop(id: string, adapter: IDataCollectorAdapter): void {
    const timer = setInterval(async () => {
      try {
        const payloads = await adapter.poll();
        if (payloads.length > 0) {
          payloads.forEach(p => this.latestNormalizedBuffer.set(p.deviceId, p));
          this.listeners.forEach(fn => fn(payloads));
        }
      } catch (err) {
        console.error(`Collector error on ${id}:`, err);
      }
    }, adapter.config.pollIntervalMs);

    this.pollTimers.set(id, timer);
  }

  public getLatestNormalized(deviceId: string): NormalizedTelemetryPayload | undefined {
    return this.latestNormalizedBuffer.get(deviceId);
  }

  public getAllLatestNormalized(): NormalizedTelemetryPayload[] {
    return Array.from(this.latestNormalizedBuffer.values());
  }

  public stop(): void {
    this.isRunning = false;
    for (const timer of this.pollTimers.values()) {
      clearInterval(timer);
    }
    this.pollTimers.clear();
    for (const adapter of this.adapters.values()) {
      adapter.stop();
    }
  }
}
