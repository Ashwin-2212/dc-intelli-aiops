import mongoose, { Document, Schema } from 'mongoose';

export type WorkOrderStatusType =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'cancelled';

export interface IWorkOrder extends Document {
  workOrderId: string;
  title: string;
  targetAsset: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: WorkOrderStatusType;
  assignedTo: string;
  slaDueHours: number;
  costEstimate?: number;
  estimatedHours?: number;
  instructions?: string;
  description: string;
  assetLifecycleState?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  isWarrantyActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkOrderSchema = new Schema<IWorkOrder>(
  {
    workOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Work order title is required'],
      trim: true,
    },
    targetAsset: {
      type: String,
      required: [true, 'Target asset identifier is required'],
      trim: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'high',
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed', 'cancelled'],
      default: 'open',
      index: true,
    },
    assignedTo: {
      type: String,
      default: 'On-Call Technician (Auto-Dispatched)',
      trim: true,
    },
    slaDueHours: {
      type: Number,
      default: 6,
    },
    costEstimate: {
      type: Number,
      default: 350,
    },
    estimatedHours: {
      type: Number,
      default: 2.0,
    },
    instructions: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    assetLifecycleState: {
      type: String,
      default: 'Operational',
    },
    purchaseDate: {
      type: Date,
    },
    warrantyExpiry: {
      type: Date,
    },
    isWarrantyActive: {
      type: Boolean,
      default: true,
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

WorkOrderSchema.index({ status: 1, severity: 1, createdAt: -1 });

export const WorkOrder = mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema);
