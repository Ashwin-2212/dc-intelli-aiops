import mongoose, { Schema } from 'mongoose';

export type DeviceType =
  | 'server'
  | 'cooling'
  | 'ups'
  | 'pdu'
  | 'switch'
  | 'storage'
  | 'sensor';

export type DeviceStatus =
  | 'healthy'
  | 'warning'
  | 'degraded'
  | 'critical'
  | 'offline';

export type DataMode =
  | 'LIVE'
  | 'SIMULATED'
  | 'PREDICTED'
  | 'ESTIMATED';

export interface IDevice {
  deviceId: string;
  name: string;
  vendor: string;
  model: string;
  serialNumber: string;
  deviceType: DeviceType;
  managementAddress?: string;
  siteId: string;
  roomId?: string;
  rackId?: string;
  uPosition?: number;
  uHeight?: number;
  status: DeviceStatus;
  health: number; // 0 - 100
  firmwareVersion?: string;
  lastSeenAt: Date;
  dataMode: DataMode;
  workloadType?: string;
  specs?: Record<string, any>;
  latestTelemetry?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true,
    },
    vendor: {
      type: String,
      default: 'Generic',
      trim: true,
    },
    model: {
      type: String,
      default: 'Enterprise Model',
      trim: true,
    },
    serialNumber: {
      type: String,
      default: '',
      trim: true,
    },
    deviceType: {
      type: String,
      enum: ['server', 'cooling', 'ups', 'pdu', 'switch', 'storage', 'sensor'],
      default: 'server',
      index: true,
    },
    managementAddress: {
      type: String,
      default: '',
      trim: true,
    },
    siteId: {
      type: String,
      required: true,
      index: true,
      default: 'dc-va-01',
    },
    roomId: {
      type: String,
      default: 'Room-A',
    },
    rackId: {
      type: String,
      index: true,
    },
    uPosition: {
      type: Number,
      min: 1,
      max: 42,
    },
    uHeight: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['healthy', 'warning', 'degraded', 'critical', 'offline'],
      default: 'healthy',
      index: true,
    },
    health: {
      type: Number,
      default: 95,
      min: 0,
      max: 100,
    },
    firmwareVersion: {
      type: String,
      default: '1.0.0',
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    dataMode: {
      type: String,
      enum: ['LIVE', 'SIMULATED', 'PREDICTED', 'ESTIMATED'],
      default: 'SIMULATED',
      index: true,
    },
    workloadType: {
      type: String,
      default: 'Compute Node',
    },
    specs: {
      type: Schema.Types.Mixed,
      default: {},
    },
    latestTelemetry: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for frequent queries
DeviceSchema.index({ siteId: 1, deviceType: 1, status: 1 });
DeviceSchema.index({ rackId: 1, uPosition: 1 });

export const Device = mongoose.model<IDevice>('Device', DeviceSchema);
