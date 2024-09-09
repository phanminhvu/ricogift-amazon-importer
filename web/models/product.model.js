import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: "String",
      required: true,
    },
      type: {
          type: "String",
          required: true,
      },
    price: {
      type: "Number",
      required: true,
    },
      description: "String",
  },
  { timestamps: true }
);

export default mongoose.model("product", productSchema);
