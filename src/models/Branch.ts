import { Schema, model, models } from 'mongoose';

export interface IBranch {
  _id: string;
  arenaId: string;
  name: string;
  address: string;
  googleMapLink: string;
  city: string;
  area: string;
  whatsappNumber: string;
  paymentBankName?: string;
  paymentAccountNumber?: string;
  paymentIban?: string;
  paymentAccountTitle?: string;
  paymentOtherMethods?: string;
  images: string[];
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    arenaId: {
      type: String,
      required: true,
      ref: 'Arena',
    },
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    googleMapLink: {
      type: String,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    area: {
      type: String,
      required: [true, 'Area is required'],
    },
    whatsappNumber: {
      type: String,
      required: [true, 'WhatsApp number is required for bookings'],
    },
    paymentBankName: {
      type: String,
      default: '',
    },
    paymentAccountNumber: {
      type: String,
      default: '',
    },
    paymentIban: {
      type: String,
      default: '',
    },
    paymentAccountTitle: {
      type: String,
      default: '',
    },
    paymentOtherMethods: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
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

BranchSchema.index({ arenaId: 1 });

export default models.Branch || model<IBranch>('Branch', BranchSchema);
