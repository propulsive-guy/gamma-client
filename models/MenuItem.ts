import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMenuItem extends Document {
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: string;
    isAvailable: boolean;
    restaurantId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
    {
        name: {
            type: String,
            required: [true, 'Item name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price must be positive'],
        },
        imageUrl: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
menuItemSchema.index({ restaurantId: 1, category: 1 });
menuItemSchema.index({ restaurantId: 1, isAvailable: 1 });

const MenuItem: Model<IMenuItem> =
    mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', menuItemSchema);

export default MenuItem;
