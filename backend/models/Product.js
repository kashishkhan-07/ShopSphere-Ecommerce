const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a product title'],
      trim: true,
      maxlength: [150, 'Title cannot be more than 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a product description'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Electronics',
        'Fashion & Apparel',
        'Home & Kitchen',
        'Beauty & Health',
        'Sports & Outdoors',
        'Books & Stationery',
        'Accessories',
        'General'
      ],
      index: true,
    },
    brand: {
      type: String,
      default: 'Generic',
    },
    price: {
      type: Number,
      required: [true, 'Please specify the price'],
      min: [0, 'Price must be positive'],
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Please specify inventory stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        fileId: { type: String, default: '' },
        thumbnailUrl: { type: String, default: '' },
      },
    ],
    attributes: [
      {
        name: String, // e.g. "Color", "Size", "Storage"
        value: String, // e.g. "Black", "XL", "256GB"
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-generate clean URL slug from title before saving
ProductSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + randomSuffix;
  }
  next();
});

// Full-text search index on title, description, and brand
ProductSchema.index({ title: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', ProductSchema);