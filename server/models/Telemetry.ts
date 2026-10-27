import mongoose, { Document, Schema } from 'mongoose';

export type TelemetryDataMode = 'LIVE' | 'SIMULATED' | 'PREDICTED' | 'ESTIMATED';
export type TelemetryQualityIndicator = 'GOOD' | 'STALE' | 'INVALID' | 'MISSING' | 'SIMULATED';

export interface ITelemetry extends Document {
  telemetryId?: string;
  deviceId: string;
  metric: string;
  value: number;
  unit: string;
  source: string;
  dataMode: TelemetryDataMode;
  quality: TelemetryQualityIndicator;
  timestamp: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const TelemetrySchema = new Schema<ITelemetry>(
  {
    telemetryId: {
      type: String,
      trim: true,
    },
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      trim: true,
      index: true,
    },
    metric: {
      type: String,
      required: [true, 'Metric name is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    value: {
      type: Number,
      required: [true, 'Metric value is required'],
    },
    unit: {
      type: String,
      default: '',
      trim: true,
    },
    source: {
      type: String,
      default: 'telemetry_simulator',
      trim: true,
    },
    dataMode: {
      type: String,
      enum: ['LIVE', 'SIMULATED', 'PREDICTED', 'ESTIMATED'],
      default: 'SIMULATED',
      index: true,
    },
    quality: {
      type: String,
      enum: ['GOOD', 'STALE', 'INVALID', 'MISSING', 'SIMULATED'],
      default: 'GOOD',
      index: true,
    },
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      default: Date.now,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// High performance compound indexes for time-series queries
TelemetrySchema.index({ deviceId: 1, metric: 1, timestamp: -1 });
TelemetrySchema.index({ timestamp: -1 });
TelemetrySchema.index({ deviceId: 1, timestamp: -1 });

export const Telemetry = mongoose.model<ITelemetry>('Telemetry', TelemetrySchema);
