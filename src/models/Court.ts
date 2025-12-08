import { Schema, model, models } from 'mongoose';

export interface IPricingSlab {
  fromTime: string;
  toTime: string;
  price: number;
  days?: string[];
}

export interface IDayPrice {
  day: string;
  price: number;
}

export interface ICourtDaySchedule {
  day: string;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

export interface ICourt {
  _id: string;
  branchId: string;
  arenaId: string;
  name: string;
  sportType: string;
  basePrice: number;
  schedule: ICourtDaySchedule[];
  dayPrices: IDayPrice[];
  timePrices: IPricingSlab[];
  slotDuration: number;
  maxPlayers?: number;
  images: string[];
  courtNotes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourtSchema = new Schema<ICourt>(
  {
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
    name: {
      type: String,
      required: [true, 'Court name is required'],
      trim: true,
    },
    sportType: {
      type: String,
      required: [true, 'Sport type is required'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0,
    },
    schedule: {
      type: [
        {
          day: { type: String, required: true },
          isOpen: { type: Boolean, default: true },
          openingTime: { type: String, required: true },
          closingTime: { type: String, required: true },
        },
      ],
      default: [
        { day: 'Monday', isOpen: true, openingTime: '06:00', closingTime: '23:00' },
        { day: 'Tuesday', isOpen: true, openingTime: '06:00', closingTime: '23:00' },
        { day: 'Wednesday', isOpen: true, openingTime: '06:00', closingTime: '23:00' },
        { day: 'Thursday', isOpen: true, openingTime: '06:00', closingTime: '23:00' },
        { day: 'Friday', isOpen: true, openingTime: '06:00', closingTime: '23:00' },
        { day: 'Saturday', isOpen: true, openingTime: '06:00', closingTime: '23:00' },
        { day: 'Sunday', isOpen: true, openingTime: '06:00', closingTime: '23:00' },
      ],
    },
    dayPrices: {
      type: [
        {
          day: String,
          price: Number,
        },
      ],
      default: [],
    },
    timePrices: {
      type: [
        {
          fromTime: String,
          toTime: String,
          price: Number,
          days: [String],
        },
      ],
      default: [],
    },
    slotDuration: {
      type: Number,
      required: true,
      default: 60, // in minutes
    },
    maxPlayers: {
      type: Number,
    },
    images: {
      type: [String],
      default: [],
    },
    courtNotes: {
      type: String,
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

CourtSchema.index({ branchId: 1 });
CourtSchema.index({ arenaId: 1 });

export default models.Court || model<ICourt>('Court', CourtSchema);
