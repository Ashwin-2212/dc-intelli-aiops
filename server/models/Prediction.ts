import mongoose, { Document, Schema } from 'mongoose';

export interface IPrediction extends Document {
  predictionId: string;
  deviceId: string;
  deviceName?: string;
  deviceType?: string;
  component?: string;
  predictionType: string;
  predictionHorizon: string;
  predictedValue?: any;
  failureProbability: number; // 0 - 100
  riskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0 - 100
  supportingEvidence: string[];
  factors?: Array<{ factor: string; contributionPercent: number }>;
  recommendation: string;
  modelVersion: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PredictionSchema = new Schema<IPrediction>(
  {
    predictionId: {
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
    },
    deviceType: {
      type: String,
      default: 'server',
    },
    component: {
      type: String,
      default: 'General Hardware',
    },
    predictionType: {
      type: String,
      default: 'hardware_failure',
      index: true,
    },
    predictionHorizon: {
      type: String,
      default: 'Next 7 days',
    },
    predictedValue: {
      type: Schema.Types.Mixed,
    },
    failureProbability: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'low', 'medium', 'high', 'critical'],
      default: 'MEDIUM',
      index: true,
    },
    confidence: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
    supportingEvidence: {
      type: [String],
      default: [],
    },
    factors: {
      type: [
        {
          factor: { type: String, required: true },
          contributionPercent: { type: Number, required: true },
        },
      ],
      default: [],
    },
    recommendation: {
      type: String,
      default: '',
    },
    modelVersion: {
      type: String,
      default: 'dc-aiops-rf-v2.4',
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

// Indexes for prediction queries
PredictionSchema.index({ deviceId: 1, generatedAt: -1 });
PredictionSchema.index({ riskLevel: 1, generatedAt: -1 });

export const Prediction = mongoose.model<IPrediction>('Prediction', PredictionSchema);
