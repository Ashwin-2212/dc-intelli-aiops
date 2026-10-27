import mongoose, { Document, Schema } from 'mongoose';

export interface ISite extends Document {
  siteId: string;
  name: string;
  location: string;
  description?: string;
  tier: 'Tier III' | 'Tier IV';
  status: 'operational' | 'degraded' | 'maintenance' | 'offline';
  totalAreaSqFt: number;
  floorsCount: number;
  zonesCount: number;
  racksCount: number;
  serversCount: number;
  powerCapacityKw: number;
  currentPowerKw: number;
  itEquipmentPowerKw: number;
  coolingPowerKw: number;
  pue: number;
  overallHealth: number;
  ambientTempC: number;
  ambientHumidityPercent: number;
  electricityRatePerKwh: number;
  carbonIntensityGramsPerKwh: number;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSchema = new Schema<ISite>(
  {
    siteId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Site name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    tier: {
      type: String,
      enum: ['Tier III', 'Tier IV'],
      default: 'Tier IV',
    },
    status: {
      type: String,
      enum: ['operational', 'degraded', 'maintenance', 'offline'],
      default: 'operational',
      index: true,
    },
    totalAreaSqFt: { type: Number, default: 45000 },
    floorsCount: { type: Number, default: 2 },
    zonesCount: { type: Number, default: 4 },
    racksCount: { type: Number, default: 24 },
    serversCount: { type: Number, default: 168 },
    powerCapacityKw: { type: Number, default: 1100 },
    currentPowerKw: { type: Number, default: 842.5 },
    itEquipmentPowerKw: { type: Number, default: 601.8 },
    coolingPowerKw: { type: Number, default: 185.2 },
    pue: { type: Number, default: 1.40 },
    overallHealth: { type: Number, default: 88 },
    ambientTempC: { type: Number, default: 22.4 },
    ambientHumidityPercent: { type: Number, default: 46.5 },
    electricityRatePerKwh: { type: Number, default: 0.12 },
    carbonIntensityGramsPerKwh: { type: Number, default: 380 },
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

export const Site = mongoose.model<ISite>('Site', SiteSchema);
