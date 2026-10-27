import mongoose, { Document, Schema } from 'mongoose';

export type DependencyNodeType =
  | 'power_system'
  | 'ups'
  | 'generator'
  | 'pdu'
  | 'cooling_plant'
  | 'crac'
  | 'rack'
  | 'server_cluster'
  | 'network_switch';

export interface IDependency extends Document {
  nodeId: string;
  name: string;
  type: DependencyNodeType;
  layer: number;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  load?: string;
  metrics?: Record<string, any>;
  parentIds: string[];
  childIds: string[];
  redundancy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DependencySchema = new Schema<IDependency>(
  {
    nodeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Node name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'power_system',
        'ups',
        'generator',
        'pdu',
        'cooling_plant',
        'crac',
        'rack',
        'server_cluster',
        'network_switch',
      ],
      required: true,
      index: true,
    },
    layer: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    status: {
      type: String,
      enum: ['healthy', 'warning', 'critical', 'offline'],
      default: 'healthy',
      index: true,
    },
    load: {
      type: String,
      default: '',
    },
    metrics: {
      type: Schema.Types.Mixed,
      default: {},
    },
    parentIds: {
      type: [String],
      default: [],
      index: true,
    },
    childIds: {
      type: [String],
      default: [],
      index: true,
    },
    redundancy: {
      type: String,
      default: 'N+1',
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

export const Dependency = mongoose.model<IDependency>('Dependency', DependencySchema);
