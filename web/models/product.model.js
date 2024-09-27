import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    amazonUrl: {
      type: "String",
      required: true,
    }
  },
  {
    id: {
      type: "String",
    }
  },
  {
    product: {
      type: "String",
      required: true
    }
  }
);

export default mongoose.model("product", productSchema);
