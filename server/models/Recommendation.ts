import mongoose, { Document, Schema } from 'mongoose';

export type RecommendationStatusType =
  | 'PENDING'
  | 'APPROVED'
  | 'DISPATCHED'
  | 'DISMISSED'
  | 'COMPLETED';

export interface IRecommendation extends Document {
  recommendationId: string;
  relatedIncidentId?: string;
  affectedResourceId: string;
  recommendation: string;
  evidence?: any;
  priority: string;
  confidence: number;
  status: RecommendationStatusType;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    recommendationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    relatedIncidentId: {
      type: String,
      index: true,
    },
    affectedResourceId: {
      type: String,
      required: true,
      index: true,
    },
    recommendation: {
      type: String,
      required: true,
    },
    evidence: {
      type: Schema.Types.Mixed,
      default: {},
    },
    priority: {
      type: String,
      default: 'HIGH',
      index: true,
    },
    confidence: {
      type: Number,
      default: 90,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'DISPATCHED', 'DISMISSED', 'COMPLETED'],
      default: 'PENDING',
      index: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
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

RecommendationSchema.index({ status: 1, priority: 1, generatedAt: -1 });

export const Recommendation = mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
