import { Schema, model, models } from 'mongoose';

export interface IArena {
  _id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  country: string; // Added for international support
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ArenaSchema = new Schema<IArena>(
  {
    ownerId: {
      type: String,
      required: true,
      ref: 'Owner',
    },
    name: {
      type: String,
      required: [true, 'Arena name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    logo: {
      type: String,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      enum: ['Pakistan', 'Indonesia', 'Malaysia', 'Other'],
      default: 'Pakistan',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ArenaSchema.index({ ownerId: 1 });
ArenaSchema.index({ slug: 1 });

export default models.Arena || model<IArena>('Arena', ArenaSchema);
