import mongoose from "mongoose";

const { Schema, model } = mongoose;

const BlogSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // For clean URLs
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.models.Blog || model("Blog", BlogSchema);
