import mongoose, { Document, Schema } from 'mongoose';
import { AlertSeverityType } from './Alert';

export type IncidentStatusType =
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'CLOSED';

export interface IIncident extends Document {
  incidentId: string;
  title: string;
  description: string;
  severity: AlertSeverityType;
  status: IncidentStatusType;
  affectedDevices: string[];
  affectedRacks?: string[];
  affectedServersCount?: number;
  contributingAlerts: string[];
  probableRootCause?: string;
  evidence?: any;
  confidence?: number;
  recommendations?: any;
  causalPropagationChain?: any;
  openedAt: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema = new Schema<IIncident>(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical', 'emergency'],
      default: 'critical',
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    affectedDevices: {
      type: [String],
      default: [],
      index: true,
    },
    affectedRacks: {
      type: [String],
      default: [],
    },
    affectedServersCount: {
      type: Number,
      default: 1,
    },
    contributingAlerts: {
      type: [String],
      default: [],
    },
    probableRootCause: {
      type: String,
      default: '',
    },
    evidence: {
      type: Schema.Types.Mixed,
      default: [],
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 85,
    },
    recommendations: {
      type: Schema.Types.Mixed,
      default: [],
    },
    causalPropagationChain: {
      type: Schema.Types.Mixed,
      default: [],
    },
    openedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    resolvedAt: {
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

// Compound index for status, severity, and openedAt queries
IncidentSchema.index({ status: 1, severity: 1, openedAt: -1 });

export const Incident = mongoose.model<IIncident>('Incident', IncidentSchema);
