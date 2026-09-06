import mongoose from "mongoose";

const shortUrlSchema = new mongoose.Schema(
    {
        originalUrl: { type: String, required: true, trim: true },
        shortCode: { type: String, required: true, unique: true, index: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        clicks: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_document, returnedUrl) => {
                delete returnedUrl._id;
                delete returnedUrl.__v;
                delete returnedUrl.user;
                delete returnedUrl.createdAt;
                delete returnedUrl.updatedAt;
            },
        },
    },
);

shortUrlSchema.virtual("id").get(function getId() {
    return this._id.toString();
});

export default mongoose.model("ShortUrl", shortUrlSchema);