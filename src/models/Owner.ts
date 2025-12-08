import { Schema, model, models } from 'mongoose';

export interface IOwner {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  accountType: 'free' | 'premium';
  premiumExpiresAt?: Date;
  isActive: boolean;
  role: 'owner' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const OwnerSchema = new Schema<IOwner>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    accountType: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    premiumExpiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin'],
      default: 'owner',
    },
  },
  {
    timestamps: true,
  }
);

OwnerSchema.index({ email: 1 });

export default models.Owner || model<IOwner>('Owner', OwnerSchema);
