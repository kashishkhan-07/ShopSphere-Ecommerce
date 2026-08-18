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
    },
    brand: {
      type: String,
      default: 'Generic',
    },
    price: {
      type: Number,
      required: [true, 'Please specify the price'],
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    images: [
      {
        url: { type: String, required: true },
      },
    ],
    rating: {
      type: Number,
      default: 4.8,
    },
    numReviews: {
      type: Number,
      default: 12,
    },
    isFeatured: {
      type: Boolean,
      default: true,
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

// Mongoose 8 pre-save hook for auto-slug
ProductSchema.pre('save', function () {
  if (this.isModified('title') || !this.slug) {
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + randomSuffix;
  }
});

ProductSchema.index({ title: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', ProductSchema);