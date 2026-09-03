import { Schema, model, models } from 'mongoose';

export interface IBooking {
  _id: string;
  courtId: string;
  branchId: string;
  arenaId: string;
  ownerId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  currency: string; // Added for multi-currency support
  paymentScreenshotURL?: string;
  paymentReferenceId?: string;
  referenceCode: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  cancellationReason?: string;
  actionHistory: Array<{
    action: 'cancelled' | 'rescheduled';
    reason: string;
    changedBy: string;
    previousDate?: string;
    previousStartTime?: string;
    previousEndTime?: string;
    newDate?: string;
    newStartTime?: string;
    newEndTime?: string;
    createdAt: Date;
  }>;
  whatsappSent: boolean;
  numberOfPlayers?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    courtId: {
      type: String,
      required: true,
      ref: 'Court',
    },
    branchId: {
      type: String,
      required: true,
      ref: 'Branch',
    },
    arenaId: {
      type: String,
      required: true,
      ref: 'Arena',
    },
    ownerId: {
      type: String,
      required: true,
      ref: 'Owner',
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    duration: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    currency: {
      type: String,
      enum: ['USD', 'IDR', 'MYR', 'PKR'],
      default: 'PKR',
    },
    paymentScreenshotURL: {
      type: String,
    },
    paymentReferenceId: {
      type: String,
    },
    referenceCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    actionHistory: {
      type: [
        {
          action: { type: String, enum: ['cancelled', 'rescheduled'], required: true },
          reason: { type: String, required: true, trim: true },
          changedBy: { type: String, required: true },
          previousDate: String,
          previousStartTime: String,
          previousEndTime: String,
          newDate: String,
          newStartTime: String,
          newEndTime: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    whatsappSent: {
      type: Boolean,
      default: false,
    },
    numberOfPlayers: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ courtId: 1, date: 1 });
BookingSchema.index({ ownerId: 1 });
BookingSchema.index({ arenaId: 1 });
BookingSchema.index({ customerPhone: 1 });
BookingSchema.index({ referenceCode: 1 });
BookingSchema.index(
  { courtId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } },
  }
);

export default models.Booking || model<IBooking>('Booking', BookingSchema);
