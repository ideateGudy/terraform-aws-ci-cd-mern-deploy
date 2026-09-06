import { motion } from "motion/react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

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
        if (editor) {
            editor.setEditable(!disabled);
        }
    }, [editor, disabled]);

    if (!editor) return null;

    const toolbarButton =
        "flex h-8 min-w-8 shrink-0 items-center justify-center rounded px-1.5 font-serif text-sm text-[#718076] transition-colors hover:bg-[#d7613c]/10 hover:text-[#d7613c] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#aab9ae]";

    const activeButton = "bg-[#d7613c]/10 text-[#d7613c]";

    return (
        <div className="w-full min-w-0 max-w-full overflow-hidden border border-[#c9d1c7] bg-[#fffdf8]/55 dark:border-[#405648] dark:bg-[#203027]/70">
            {/* Toolbar */}
            <div className="flex w-full min-w-0 flex-wrap items-center gap-1 border-b border-[#c9d1c7] px-2 py-1.5 dark:border-[#405648]">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleBold().run()
                    }
                    className={`${toolbarButton} ${
                        editor.isActive("bold") ? activeButton : ""
                    }`}
                    aria-label="Bold"
                    aria-pressed={editor.isActive("bold")}
                >
                    <strong>B</strong>
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                    }
                    className={`${toolbarButton} ${
                        editor.isActive("italic") ? activeButton : ""
                    }`}
                    aria-label="Italic"
                    aria-pressed={editor.isActive("italic")}
                >
                    <em>I</em>
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleStrike().run()
                    }
                    className={`${toolbarButton} ${
                        editor.isActive("strike") ? activeButton : ""
                    }`}
                    aria-label="Strikethrough"
                    aria-pressed={editor.isActive("strike")}
                >
                    <s>S</s>
                </button>

                <span className="mx-1 hidden h-5 w-px bg-[#c9d1c7] sm:block dark:bg-[#405648]" />

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    className={`${toolbarButton} ${
                        editor.isActive("bulletList") ? activeButton : ""
                    }`}
                    aria-label="Bullet list"
                    aria-pressed={editor.isActive("bulletList")}
                >
                    •
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    className={`${toolbarButton} ${
                        editor.isActive("orderedList") ? activeButton : ""
                    }`}
                    aria-label="Numbered list"
                    aria-pressed={editor.isActive("orderedList")}
                >
                    1.
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                    className={`${toolbarButton} ${
                        editor.isActive("blockquote") ? activeButton : ""
                    }`}
                    aria-label="Blockquote"
                    aria-pressed={editor.isActive("blockquote")}
                >
                    “
                </button>

                <span className="hidden flex-1 sm:block" />

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
                    className="h-8 shrink-0 px-2 font-sans text-[10px] uppercase tracking-[.08em] text-[#718076] transition-colors hover:text-[#d7613c] disabled:opacity-50 dark:text-[#aab9ae]"
                >
                    Clear
                </button>
            </div>

            {/* Editor */}
            <EditorContent
                editor={editor}
                className={[
                    "w-full min-w-0 max-w-full overflow-hidden",

                    // Tiptap editor
                    "[&_.tiptap]:box-border",
                    "[&_.tiptap]:block",
                    "[&_.tiptap]:w-full",
                    "[&_.tiptap]:min-w-0",
                    "[&_.tiptap]:max-w-full",
                    "[&_.tiptap]:min-h-52",
                    "[&_.tiptap]:overflow-x-hidden",
                    "[&_.tiptap]:wrap-break-word",
                    "[&_.tiptap]:whitespace-normal",
                    "[&_.tiptap]:p-3.5",
                    "[&_.tiptap]:outline-none",
                    "[&_.tiptap]:text-[16px]",
                    "[&_.tiptap]:leading-[1.55]",
                    "[&_.tiptap]:text-[#27352c]",
                    "dark:[&_.tiptap]:text-[#edf4ee]",

                    // Prevent long strings / URLs from overflowing
                    "[&_.tiptap_*]:max-w-full",
                    "[&_.tiptap_a]:break-all",
                    "[&_.tiptap_code]:break-all",

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

export default function DiaryEntry({
    entry,
    editing,
    saving,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onDelete,
}) {
    const navigate = useNavigate();

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: entry.title,
            content: entry.content,
        },
    });

    useEffect(() => {
        reset({
            title: entry.title,
            content: entry.content,
        });
    }, [reset, entry.title, entry.content]);

    const actionClass =
        "border-0 bg-transparent p-0 font-sans text-[11px] uppercase tracking-[.08em] text-[#718076] transition-colors hover:text-[#d7613c] disabled:opacity-55 dark:text-[#aab9ae]";

    const getPreview = (html, maxLength = 180) => {
        const div = document.createElement("div");
        div.innerHTML = html || "";

        const text = div.textContent || div.innerText || "";

        if (text.length <= maxLength) {
            return text;
        }

        return `${text.slice(0, maxLength).trim()}…`;
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: entry.index * 0.055 }}
            className="w-full min-w-0 max-w-full border-b border-[#c9d1c7] py-6 first:border-t dark:border-[#405648]"
        >
            {editing ? (
                <form
                    className="flex w-full min-w-0 max-w-full flex-col gap-3"
                    onSubmit={handleSubmit((values) =>
                        onSaveEdit(values, entry)
                    )}
                    noValidate
                >
                    <input
                        autoFocus
                        disabled={saving}
                        className="box-border w-full min-w-0 max-w-full border-0 border-b border-[#d7613c] bg-transparent py-1 text-[clamp(20px,5vw,25px)] text-[#27352c] outline-none dark:text-[#edf4ee]"
                        type="text"
                        {...register("title", {
                            required: "Give this entry a title.",
                            validate: (value) =>
                                value.trim()
                                    ? true
                                    : "Give this entry a title.",
                        })}
                        aria-label={`Edit ${entry.title}`}
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
                                disabled={saving}
                            />
                        )}
                    />

                    {errors.content && (
                        <span className="font-sans text-[11px] text-[#b54f32] dark:text-[#f09a78]">
                            {errors.content.message}
                        </span>
                    )}

                    <div className="flex flex-wrap justify-end gap-4">
                        <button
                            type="submit"
                            className={`${actionClass} text-[#d7613c]`}
                            disabled={saving}
                        >
                            Save
                        </button>

                        <button
                            type="button"
                            className={actionClass}
                            onClick={onCancelEdit}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="flex min-w-0 flex-col gap-4">
                        <div className="min-w-0 max-w-full">
                            <h2 className="max-w-full wrap-break-word text-[25px] font-normal tracking-[-.02em] dark:text-[#f2f6f1]">
                                {entry.title}
                            </h2>

                            <p className="mt-2 max-w-2xl wrap-break-word text-[16px] leading-[1.55] text-[#718076] dark:text-[#aab9ae]">
                                {getPreview(entry.content)}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                            <motion.button
                                whileTap={{ scale: 0.92 }}
                                type="button"
                                className={`${actionClass} text-[#d7613c]`}
                                onClick={() =>
                                    navigate(`/diary/${entry.id}`)
                                }
                            >
                                Read entry
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.92 }}
                                type="button"
                                className={actionClass}
                                onClick={() => onStartEdit(entry)}
                            >
                                Edit
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.92 }}
                                type="button"
                                className={`${actionClass} text-[#9aa59c]`}
                                onClick={() => onDelete(entry.id)}
                            >
                                Delete
                            </motion.button>
                        </div>
                    </div>

                    <time className="mt-4 block font-sans text-[10px] uppercase tracking-widest text-[#9aa59c]">
                        {entry.updatedAt
                            ? new Date(
                                  entry.updatedAt
                              ).toLocaleDateString()
                            : "Recently updated"}
                    </time>
                </>
            )}
        </motion.article>
    );
}
