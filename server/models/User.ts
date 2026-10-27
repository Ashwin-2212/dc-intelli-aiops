import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRoleType =
  | 'ADMIN'
  | 'DATA_CENTER_MANAGER'
  | 'ENGINEER'
  | 'OPERATOR'
  | 'VIEWER'
  | 'MANAGER'
  | 'ANALYST';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRoleType;
  title?: string;
  department?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: [
        'ADMIN',
        'DATA_CENTER_MANAGER',
        'ENGINEER',
        'OPERATOR',
        'VIEWER',
        'MANAGER',
        'ANALYST',
      ],
      default: 'OPERATOR',
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '👤',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save hook to hash passwords if modified
UserSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  // If it's already a bcrypt hash (starts with $2a$, $2b$, or $2y$), don't re-hash
  if (/^\$2[aby]\$\d{2}\$/.test(this.passwordHash)) return;

  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser, UserModel>('User', UserSchema);
