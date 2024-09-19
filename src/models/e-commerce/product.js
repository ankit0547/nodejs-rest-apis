const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  brand: { type: String },
  stock: { type: Number, required: true },
  images: [{ type: String }], // Array of image URLs
  ratings: {
    averageRating: { type: Number, default: 0 },
    numberOfRatings: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);
