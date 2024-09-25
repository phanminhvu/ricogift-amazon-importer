import mongoose from "mongoose";

const shopSchema = mongoose.Schema(
  {
    shop: {
      type: "String",
      required: true,
    },
    token: {
      type: "String",
    },
    plan: {
      type: "String",
      default: "FREE",
    },
    charge_id: {
      type: "String",
      default: "",
    },
    installed: {
      type: "Boolean",
      default: false,
    },
    isOnboarded: {
      type: "Boolean",
      default: false,
    },
    email: {
      type: "String",
    },
    groupFaq: [],
  },
  { timestamps: true }
);

export default mongoose.model("Shop", shopSchema);
