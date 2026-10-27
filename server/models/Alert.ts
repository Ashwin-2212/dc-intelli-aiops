import mongoose, { Document, Schema } from 'mongoose';

export type AlertSeverityType = 'info' | 'warning' | 'critical' | 'emergency';
export type AlertStatusType = 'active' | 'acknowledged' | 'resolved';

export interface IAlert extends Document {
  alertId: string;
  deviceId: string;
  deviceName?: string;
  deviceType?: string;
  metric: string;
  observedValue: any;
  threshold: any;
  severity: AlertSeverityType;
  message: string;
  possibleCause?: string;
  recommendedAction?: string;
  source: string;
  status: AlertStatusType;
  anomalyScore?: number;
  timestamp: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    alertId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      trim: true,
      index: true,
    },
    deviceName: {
      type: String,
      default: '',
      trim: true,
    },
    deviceType: {
      type: String,
      default: 'server',
      trim: true,
    },
    metric: {
      type: String,
      required: true,
      trim: true,
    },
    observedValue: {
      type: Schema.Types.Mixed,
      required: true,
    },
    threshold: {
      type: Schema.Types.Mixed,
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical', 'emergency'],
      default: 'warning',
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    possibleCause: {
      type: String,
      default: '',
    },
    recommendedAction: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: 'ai_anomaly_engine',
    },
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved'],
      default: 'active',
      index: true,
    },
    anomalyScore: {
      type: Number,
      min: 0,
      max: 1,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    acknowledgedBy: {
      type: String,
    },
    acknowledgedAt: {
      type: Date,
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

// Indexes based on actual access patterns
AlertSchema.index({ status: 1, timestamp: -1 });
AlertSchema.index({ deviceId: 1, timestamp: -1 });

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
