import mongoose, { Document, Schema } from 'mongoose';

export interface IRack extends Document {
  rackId: string;
  name: string;
  siteId: string;
  zone: string;
  row: string;
  position: number;
  maxU: number;
  usedU: number;
  maxPowerKw: number;
  currentPowerKw: number;
  inletTempC: number;
  outletTempC: number;
  humidityPercent: number;
  airflowCfm: number;
  status: 'healthy' | 'warning' | 'degraded' | 'critical' | 'offline';
  healthScore: number;
  pduStatus: 'normal' | 'warning' | 'overload';
  weightKg: number;
  maxWeightKg: number;
  createdAt: Date;
  updatedAt: Date;
}

const RackSchema = new Schema<IRack>(
  {
    rackId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Rack name is required'],
      trim: true,
    },
    siteId: {
      type: String,
      required: true,
      index: true,
      default: 'dc-va-01',
    },
    zone: {
      type: String,
      default: 'Zone A',
      index: true,
    },
    row: {
      type: String,
      default: 'Row-1',
    },
    position: {
      type: Number,
      default: 1,
    },
    maxU: {
      type: Number,
      default: 42,
    },
    usedU: {
      type: Number,
      default: 0,
    },
    maxPowerKw: {
      type: Number,
      default: 15.0,
    },
    currentPowerKw: {
      type: Number,
      default: 0.0,
    },
    inletTempC: {
      type: Number,
      default: 22.0,
    },
    outletTempC: {
      type: Number,
      default: 30.0,
    },
    humidityPercent: {
      type: Number,
      default: 45.0,
    },
    airflowCfm: {
      type: Number,
      default: 2000,
    },
    status: {
      type: String,
      enum: ['healthy', 'warning', 'degraded', 'critical', 'offline'],
      default: 'healthy',
      index: true,
    },
    healthScore: {
      type: Number,
      default: 90,
      min: 0,
      max: 100,
    },
    pduStatus: {
      type: String,
      enum: ['normal', 'warning', 'overload'],
      default: 'normal',
    },
    weightKg: {
      type: Number,
      default: 500,
    },
    maxWeightKg: {
      type: Number,
      default: 1000,
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

// Compound index for queries by site and zone
RackSchema.index({ siteId: 1, zone: 1 });

export const Rack = mongoose.model<IRack>('Rack', RackSchema);
