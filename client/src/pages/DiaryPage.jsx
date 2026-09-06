import { motion } from "motion/react";
import { useEffect } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import DiaryEntry from "../components/DiaryEntry.jsx";
import AuthPage from "./AuthPage.jsx";
import {
    useAddEntryMutation,
    useDeleteEntryMutation,
    useGetEntriesQuery,
    useUpdateEntryMutation,
} from "../store/apiSlice.js";

const inputClass =
    "w-full rounded-sm border border-[#c9d1c7] bg-[#fffdf8]/55 px-4 py-3.5 text-[#27352c] outline-none placeholder:text-[#9aa59c] focus:border-[#d7613c] dark:border-[#405648] dark:bg-[#203027]/70 dark:text-[#edf4ee] dark:placeholder:text-[#819687]";

function DiaryEditor({ value, onChange, disabled }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value || "",
        editable: !disabled,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) return;

        const currentContent = editor.getHTML();

        if (value !== currentContent) {
            editor.commands.setContent(value || "", false);
        }
    }, [editor, value]);

    useEffect(() => {
        editor?.setEditable(!disabled);
    }, [editor, disabled]);

    if (!editor) return null;

    return (
        <div
            className={[
                "overflow-hidden rounded-sm border",
                "border-[#c9d1c7] bg-[#fffdf8]/55",
                "dark:border-[#405648] dark:bg-[#203027]/70",
            ].join(" ")}
        >
            {/* Toolbar */}
            <div
                className={[
                    "flex items-center gap-1 border-b px-2 py-1.5",
                    "border-[#c9d1c7]",
                    "dark:border-[#405648]",
                ].join(" ")}
            >
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleBold().run()
                    }
                    className={[
                        "flex h-7 min-w-7 items-center justify-center rounded",
                        "font-serif text-sm text-[#718076]",
                        "hover:bg-[#d7613c]/10 hover:text-[#d7613c]",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        editor.isActive("bold")
                            ? "bg-[#d7613c]/10 text-[#d7613c]"
                            : "",
                    ].join(" ")}
                    aria-label="Bold"
                >
                    <strong>B</strong>
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                    }
                    className={[
                        "flex h-7 min-w-7 items-center justify-center rounded",
                        "font-serif text-sm text-[#718076]",
                        "hover:bg-[#d7613c]/10 hover:text-[#d7613c]",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        editor.isActive("italic")
                            ? "bg-[#d7613c]/10 text-[#d7613c]"
                            : "",
                    ].join(" ")}
                    aria-label="Italic"
                >
                    <em>I</em>
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleStrike().run()
                    }
                    className={[
                        "flex h-7 min-w-7 items-center justify-center rounded",
                        "font-serif text-sm text-[#718076]",
                        "hover:bg-[#d7613c]/10 hover:text-[#d7613c]",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        editor.isActive("strike")
                            ? "bg-[#d7613c]/10 text-[#d7613c]"
                            : "",
                    ].join(" ")}
                    aria-label="Strikethrough"
                >
                    <s>S</s>
                </button>

                <span className="mx-1 h-5 w-px bg-[#c9d1c7] dark:bg-[#405648]" />

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    className={[
                        "flex h-7 min-w-7 items-center justify-center rounded text-sm",
                        "text-[#718076] hover:bg-[#d7613c]/10 hover:text-[#d7613c]",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        editor.isActive("bulletList")
                            ? "bg-[#d7613c]/10 text-[#d7613c]"
                            : "",
                    ].join(" ")}
                    aria-label="Bullet list"
                >
                    •
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    className={[
                        "flex h-7 min-w-7 items-center justify-center rounded text-[11px]",
                        "text-[#718076] hover:bg-[#d7613c]/10 hover:text-[#d7613c]",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        editor.isActive("orderedList")
                            ? "bg-[#d7613c]/10 text-[#d7613c]"
                            : "",
                    ].join(" ")}
                    aria-label="Numbered list"
                >
                    1.
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                    className={[
                        "flex h-7 min-w-7 items-center justify-center rounded",
                        "font-serif text-lg text-[#718076]",
                        "hover:bg-[#d7613c]/10 hover:text-[#d7613c]",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        editor.isActive("blockquote")
                            ? "bg-[#d7613c]/10 text-[#d7613c]"
                            : "",
                    ].join(" ")}
                    aria-label="Quote"
                >
                    “
                </button>

                <span className="flex-1" />

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .clearNodes()
                            .unsetAllMarks()
                            .run()
                    }
                    className="h-7 px-2 font-sans text-[10px] uppercase tracking-[.08em] text-[#718076] hover:text-[#d7613c] disabled:opacity-50 dark:text-[#aab9ae]"
                >
                    Clear
                </button>
            </div>

            {/* Content */}
            <EditorContent
                editor={editor}
                className={[
                    "min-h-52",
                    "[&_.tiptap]:min-h-52",
                    "[&_.tiptap]:p-3.5",
                    "[&_.tiptap]:outline-none",
                    "[&_.tiptap]:text-[16px]",
                    "[&_.tiptap]:leading-[1.55]",
                    "[&_.tiptap]:text-[#27352c]",
                    "dark:[&_.tiptap]:text-[#edf4ee]",

                    // Placeholder
                    "[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none",
                    "[&_.tiptap_p.is-editor-empty:first-child::before]:float-left",
                    "[&_.tiptap_p.is-editor-empty:first-child::before]:h-0",
                    "[&_.tiptap_p.is-editor-empty:first-child::before]:text-[#9aa59c]",
                    "[&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",

                    // Paragraphs
                    "[&_.tiptap_p]:mb-3",
                    "[&_.tiptap_p:last-child]:mb-0",

                    // Lists
                    "[&_.tiptap_ul]:my-2",
                    "[&_.tiptap_ul]:list-disc",
                    "[&_.tiptap_ul]:pl-6",
                    "[&_.tiptap_ol]:my-2",
                    "[&_.tiptap_ol]:list-decimal",
                    "[&_.tiptap_ol]:pl-6",

                    // Blockquote
                    "[&_.tiptap_blockquote]:my-4",
                    "[&_.tiptap_blockquote]:border-l-2",
                    "[&_.tiptap_blockquote]:border-[#d7613c]",
                    "[&_.tiptap_blockquote]:pl-4",
                    "[&_.tiptap_blockquote]:text-[#718076]",
                    "dark:[&_.tiptap_blockquote]:text-[#aab9ae]",
                ].join(" ")}
            />
        </div>
    );
}

export default function DiaryPage() {
    const user = useSelector((state) => state.auth.user);

    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");

    const { data: entries = [], isLoading } = useGetEntriesQuery(user?.id, {
        skip: !user,
    });

    const [addEntry, { isLoading: adding }] = useAddEntryMutation();
    const [updateEntry, { isLoading: savingEdit }] =
        useUpdateEntryMutation();
    const [deleteEntry] = useDeleteEntryMutation();

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: "",
            content: "",
        },
    });

    if (!user) return <AuthPage />;

    const handleAdd = async (values) => {
        try {
            setError("");

            await addEntry({
                title: values.title.trim(),
                content: values.content,
            }).unwrap();

            reset({
                title: "",
                content: "",
            });
        } catch (e) {
            setError(
                e.data?.error || "Unable to save your entry."
            );
        }
    };

    const handleSave = async (values, entry) => {
        try {
            setError("");

            await updateEntry({
                id: entry.id,
                title: values.title.trim(),
                content: values.content,
            }).unwrap();

            setEditingId(null);
        } catch (e) {
            setError(
                e.data?.error || "Unable to update your entry."
            );
        }
    };

    const handleDelete = async (id) => {
        try {
            setError("");
            await deleteEntry(id).unwrap();
        } catch (e) {
            setError(
                e.data?.error || "Unable to delete your entry."
            );
        }
    };

    return (
        <main className="mx-auto w-[min(1120px,calc(100%-32px))] flex-1 py-[8vh] sm:w-[min(1120px,calc(100%-48px))]">
            <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col justify-between gap-6 border-b border-[#c9d1c7] pb-7 dark:border-[#405648] sm:flex-row sm:items-end"
            >
                <div>
                    <p className="mb-4.5 font-sans text-[11px] font-bold uppercase tracking-[.14em] text-[#d7613c]">
                        Your private pages
                    </p>

                    <h1 className="text-[clamp(48px,6vw,82px)] leading-[.92] tracking-[-.045em] dark:text-[#f2f6f1]">
                        Dear diary.
                    </h1>
                </div>

                <p className="max-w-56 text-[18px] leading-[1.3] text-[#718076] dark:text-[#aab9ae]">
                    A quiet place for the thoughts you want to keep.
                </p>
            </motion.section>

            <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mx-auto mt-9 max-w-205"
            >
                <form
                    onSubmit={handleSubmit(handleAdd)}
                    className="flex flex-col gap-3 border-b border-[#c9d1c7] pb-9 dark:border-[#405648]"
                    noValidate
                >
                    <input
                        className={inputClass}
                        type="text"
                        {...register("title", {
                            required: "Give this entry a title.",
                            validate: (value) =>
                                value.trim()
                                    ? true
                                    : "Give this entry a title.",
                        })}
                        placeholder="Entry title"
                        disabled={adding}
                        aria-label="Entry title"
                    />

                    {errors.title && (
                        <span className="font-sans text-[11px] text-[#b54f32] dark:text-[#f09a78]">
                            {errors.title.message}
                        </span>
                    )}

                    <Controller
                        name="content"
                        control={control}
                        rules={{
                            validate: (value) => {
                                const text =
                                    value
                                        ?.replace(/<[^>]*>/g, "")
                                        .replace(/&nbsp;/g, " ")
                                        .trim() || "";

                                return text
                                    ? true
                                    : "Write something before saving.";
                            },
                        }}
                        render={({ field }) => (
                            <DiaryEditor
                                value={field.value}
                                onChange={field.onChange}
                                disabled={adding}
                                placeholder="What is on your mind?"
                            />
                        )}
                    />

                    {errors.content && (
                        <span className="font-sans text-[11px] text-[#b54f32] dark:text-[#f09a78]">
                            {errors.content.message}
                        </span>
                    )}

                    <div className="flex justify-end">
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="rounded-sm border-0 bg-[#27352c] px-5 py-3.5 font-sans text-xs font-bold text-[#fffdf8] hover:bg-[#d7613c] disabled:opacity-60"
                            disabled={adding}
                        >
                            {adding ? "Saving..." : "Save entry"}
                        </motion.button>
                    </div>
                </form>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="my-4 border-l-[3px] border-[#d7613c] bg-[#f8ded4] px-3.5 py-3 font-sans text-[13px] text-[#8d3d29] dark:bg-[#492b25] dark:text-[#f4b09a]"
                        role="alert"
                    >
                        {error}
                    </motion.div>
                )}

                <div className="mt-9 border-t border-[#c9d1c7] dark:border-[#405648]">
                    {isLoading ? (
                        <p className="py-14 text-[#718076] dark:text-[#aab9ae]">
                            Opening your diary...
                        </p>
                    ) : entries.length === 0 ? (
                        <div className="flex flex-col gap-1.5 py-14 text-[#718076] dark:text-[#aab9ae]">
                            <strong className="text-2xl font-normal text-[#27352c] dark:text-[#f2f6f1]">
                                Your pages are blank.
                            </strong>

                            <span>Write the first one above.</span>
                        </div>
                    ) : (
                        entries.map((entry, index) => (
                            <DiaryEntry
                                key={entry.id}
                                entry={{ ...entry, index }}
                                editing={editingId === entry.id}
                                saving={savingEdit}
                                onStartEdit={(item) => {
                                    setEditingId(item.id);
                                    setError("");
                                }}
                                onCancelEdit={() => setEditingId(null)}
                                onSaveEdit={handleSave}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            </motion.section>
        </main>
    );
}
