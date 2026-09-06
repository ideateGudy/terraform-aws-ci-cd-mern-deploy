import mongoose from "mongoose";

const diaryEntrySchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 160 },
        content: { type: String, required: true, trim: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_document, returnedEntry) => {
                delete returnedEntry._id;
                delete returnedEntry.__v;
                delete returnedEntry.user;
            },
        },
    },
);

diaryEntrySchema.virtual("id").get(function getId() {
    return this._id.toString();
});

export default mongoose.model("DiaryEntry", diaryEntrySchema);