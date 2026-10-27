import mongoose, { Document, Schema } from 'mongoose';

export interface ISimulation extends Document {
  scenarioId: string;
  scenarioName: string;
  scenarioType: string;
  inputConfiguration: Record<string, any>;
  affectedRackOrResources: string[];
  calculatedPowerImpact?: string | number;
  coolingImpact?: string | number;
  capacityImpact?: string | number;
  riskAssessment: 'SAFE' | 'MODERATE' | 'HIGH RISK' | 'CRITICAL RISK';
  decisionSummary?: string;
  recommendations?: string[];
  result?: Record<string, any>;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SimulationSchema = new Schema<ISimulation>(
  {
    scenarioId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    scenarioName: {
      type: String,
      required: [true, 'Scenario name is required'],
      trim: true,
    },
    scenarioType: {
      type: String,
      default: 'what_if_sandbox',
      index: true,
    },
    inputConfiguration: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    affectedRackOrResources: {
      type: [String],
      default: [],
    },
    calculatedPowerImpact: {
      type: Schema.Types.Mixed,
    },
    coolingImpact: {
      type: Schema.Types.Mixed,
    },
    capacityImpact: {
      type: Schema.Types.Mixed,
    },
    riskAssessment: {
      type: String,
      enum: ['SAFE', 'MODERATE', 'HIGH RISK', 'CRITICAL RISK'],
      default: 'SAFE',
      index: true,
    },
    decisionSummary: {
      type: String,
      default: '',
    },
    recommendations: {
      type: [String],
      default: [],
    },
    result: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: String,
      default: 'system_operator',
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

SimulationSchema.index({ scenarioType: 1, createdAt: -1 });

export const Simulation = mongoose.model<ISimulation>('Simulation', SimulationSchema);
