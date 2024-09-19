const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  amount: { type: Number, required: true },
  method: { type: String, required: true }, // e.g., "Credit Card", "PayPal"
  status: { type: String, default: "Pending" }, // e.g., "Pending", "Completed", "Failed"
  transactionId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model("Payment", paymentSchema);
