import mongoose, { Document, Schema } from 'mongoose';

export type AuditOutcomeType = 'SUCCESS' | 'FAILURE' | 'DENIED';

export interface IAuditLog extends Document {
  userId: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: Date;
  outcome: AuditOutcomeType;
  relevantMetadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      default: '',
    },
    userRole: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    outcome: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'DENIED'],
      default: 'SUCCESS',
      index: true,
    },
    relevantMetadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
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

// Indexes based on actual compliance and audit query patterns
AuditLogSchema.index({ timestamp: -1, userId: 1 });
AuditLogSchema.index({ resourceType: 1, timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
