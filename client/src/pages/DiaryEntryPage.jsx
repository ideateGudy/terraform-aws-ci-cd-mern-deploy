import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import AuthPage from "./AuthPage.jsx";

import {
    useGetEntriesQuery,
    useUpdateEntryMutation,
    useDeleteEntryMutation,
} from "../store/apiSlice.js";

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

                    "[&_.tiptap]:box-border",
                    "[&_.tiptap]:block",
                    "[&_.tiptap]:w-full",
                    "[&_.tiptap]:min-w-0",
                    "[&_.tiptap]:max-w-full",
                    "[&_.tiptap]:min-h-105",
                    "[&_.tiptap]:overflow-x-hidden",
                    "[&_.tiptap]:wrap-break-word",
                    "[&_.tiptap]:whitespace-normal",
                    "[&_.tiptap]:p-4",
                    "[&_.tiptap]:outline-none",
                    "[&_.tiptap]:text-[17px]",
                    "[&_.tiptap]:leading-[1.8]",
                    "[&_.tiptap]:text-[#27352c]",
                    "sm:[&_.tiptap]:p-5",
                    "dark:[&_.tiptap]:text-[#edf4ee]",

                    // Prevent long URLs / words from creating horizontal scroll
                    "[&_.tiptap_*]:max-w-full",
                    "[&_.tiptap_a]:break-all",
                    "[&_.tiptap_code]:break-all",

                    // Paragraphs
                    "[&_.tiptap_p]:mb-6",
                    "[&_.tiptap_p:last-child]:mb-0",

                    // Inline formatting
                    "[&_.tiptap_strong]:font-semibold",
                    "[&_.tiptap_em]:italic",
                    "[&_.tiptap_s]:line-through",

                    // Lists
                    "[&_.tiptap_ul]:my-6",
                    "[&_.tiptap_ul]:list-disc",
                    "[&_.tiptap_ul]:pl-7",
                    "[&_.tiptap_ol]:my-6",
                    "[&_.tiptap_ol]:list-decimal",
                    "[&_.tiptap_ol]:pl-7",
                    "[&_.tiptap_li]:mb-2",

                    // Blockquote
                    "[&_.tiptap_blockquote]:my-8",
                    "[&_.tiptap_blockquote]:border-l-2",
                    "[&_.tiptap_blockquote]:border-[#d7613c]",
                    "[&_.tiptap_blockquote]:pl-5",
                    "[&_.tiptap_blockquote]:italic",
                    "[&_.tiptap_blockquote]:text-[#718076]",
                    "dark:[&_.tiptap_blockquote]:text-[#aab9ae]",
                ].join(" ")}
            />
        </div>
    );
}

export default function DiaryEntryPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const user = useSelector((state) => state.auth.user);

    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");

    const {
        data: entries = [],
        isLoading,
        isError,
    } = useGetEntriesQuery(user?.id, {
        skip: !user,
    });

    const [updateEntry, { isLoading: saving }] =
        useUpdateEntryMutation();

    const [deleteEntry, { isLoading: deleting }] =
        useDeleteEntryMutation();

    if (!user) {
        return <AuthPage />;
    }

    if (isLoading) {
        return (
            <main className="mx-auto w-[min(900px,calc(100%-32px))] min-w-0 flex-1 py-[8vh] sm:w-[min(900px,calc(100%-48px))]">
                <p className="text-[#718076] dark:text-[#aab9ae]">
                    Opening your diary...
                </p>
            </main>
        );
    }

    const entry = entries.find(
        (item) => String(item.id) === String(id)
    );

    if (isError || !entry) {
        return (
            <main className="mx-auto w-[min(900px,calc(100%-32px))] min-w-0 flex-1 py-[8vh] sm:w-[min(900px,calc(100%-48px))]">
                <button
                    type="button"
                    onClick={() => navigate("/diary")}
                    className="font-sans text-[11px] uppercase tracking-[.08em] text-[#718076] hover:text-[#d7613c] dark:text-[#aab9ae]"
                >
                    ← Back to diary
                </button>

                <div className="py-20">
                    <p className="font-sans text-[11px] uppercase tracking-[.14em] text-[#d7613c]">
                        Diary
                    </p>

                    <h1 className="mt-3 text-4xl font-normal text-[#27352c] dark:text-[#f2f6f1]">
                        Entry not found.
                    </h1>
                </div>
            </main>
        );
    }

    const handleStartEdit = () => {
        setTitle(entry.title || "");
        setContent(entry.content || "");
        setError("");
        setEditing(true);
    };

    const handleCancelEdit = () => {
        setTitle("");
        setContent("");
        setError("");
        setEditing(false);
    };

    const handleSave = async (event) => {
        event.preventDefault();

        if (!title.trim()) {
            setError("Give this entry a title.");
            return;
        }

        const text =
            content
                ?.replace(/<[^>]*>/g, "")
                .replace(/&nbsp;/g, " ")
                .trim() || "";

        if (!text) {
            setError("Write something before saving.");
            return;
        }

        try {
            setError("");

            await updateEntry({
                id: entry.id,
                title: title.trim(),
                content,
            }).unwrap();

            setEditing(false);
        } catch (e) {
            setError(
                e.data?.error ||
                    "Unable to update your entry."
            );
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Delete this diary entry?"
        );

        if (!confirmed) return;

        try {
            setError("");

            await deleteEntry(entry.id).unwrap();

            navigate("/diary");
        } catch (e) {
            setError(
                e.data?.error ||
                    "Unable to delete your entry."
            );
        }
    };

    const formattedDate = entry.updatedAt
        ? new Date(entry.updatedAt).toLocaleDateString(
              undefined,
              {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
              }
          )
        : "Recently updated";

    const actionClass =
        "font-sans text-[11px] uppercase tracking-[.08em] " +
        "text-[#718076] transition-colors hover:text-[#d7613c] " +
        "disabled:cursor-not-allowed disabled:opacity-50 " +
        "dark:text-[#aab9ae]";

    return (
        <main className="mx-auto w-[min(900px,calc(100%-32px))] min-w-0 max-w-full flex-1 py-[8vh] sm:w-[min(900px,calc(100%-48px))]">
            <motion.article
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="min-w-0 max-w-full"
            >
                {/* Back */}
                <button
                    type="button"
                    onClick={() => navigate("/diary")}
                    className={`${actionClass} mb-10`}
                >
                    ← Back to diary
                </button>

                {editing ? (
                    <form
                        onSubmit={handleSave}
                        className="flex w-full min-w-0 max-w-full flex-col gap-5"
                    >
                        {/* Title */}
                        <input
                            autoFocus
                            value={title}
                            onChange={(event) =>
                                setTitle(event.target.value)
                            }
                            disabled={saving}
                            className="box-border w-full min-w-0 max-w-full border-0 border-b border-[#d7613c] bg-transparent py-2 text-[clamp(28px,7vw,52px)] font-normal leading-tight tracking-tight text-[#27352c] outline-none placeholder:text-[#9aa59c] dark:text-[#f2f6f1]"
                            placeholder="Entry title"
                        />

                        {/* Tiptap Content */}
                        <DiaryEditor
                            value={content}
                            onChange={setContent}
                            disabled={saving}
                        />

                        {error && (
                            <div
                                className="w-full min-w-0 max-w-full border-l-[3px] border-[#d7613c] bg-[#f8ded4] px-3.5 py-3 font-sans text-[13px] text-[#8d3d29] dark:bg-[#492b25] dark:text-[#f4b09a]"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <div className="flex flex-wrap justify-end gap-x-5 gap-y-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className={`${actionClass} text-[#d7613c]`}
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>

                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={saving}
                                className={actionClass}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        {/* Header */}
                        <header className="min-w-0 max-w-full border-b border-[#c9d1c7] pb-7 dark:border-[#405648]">
                            <p className="font-sans text-[10px] uppercase tracking-[.16em] text-[#9aa59c]">
                                Diary entry
                            </p>

                            <h1 className="mt-3 max-w-full wrap-break-word text-[clamp(32px,8vw,52px)] font-normal leading-tight tracking-tight text-[#27352c] dark:text-[#f2f6f1]">
                                {entry.title}
                            </h1>

                            <time className="mt-4 block font-sans text-[10px] uppercase tracking-widest text-[#9aa59c]">
                                {formattedDate}
                            </time>
                        </header>

                        {/* Full content */}
                        <div
                            className={[
                                "min-w-0 max-w-full overflow-hidden py-10",
                                "wrap-break-word",
                                "text-[17px] leading-[1.8]",
                                "text-[#27352c]",
                                "dark:text-[#edf4ee]",

                                "[&_p]:mb-6",
                                "[&_p:last-child]:mb-0",

                                "[&_strong]:font-semibold",
                                "[&_em]:italic",
                                "[&_s]:line-through",

                                "[&_ul]:my-6",
                                "[&_ul]:list-disc",
                                "[&_ul]:pl-7",

                                "[&_ol]:my-6",
                                "[&_ol]:list-decimal",
                                "[&_ol]:pl-7",

                                "[&_li]:mb-2",

                                "[&_blockquote]:my-8",
                                "[&_blockquote]:border-l-2",
                                "[&_blockquote]:border-[#d7613c]",
                                "[&_blockquote]:pl-5",
                                "[&_blockquote]:italic",
                                "[&_blockquote]:text-[#718076]",
                                "dark:[&_blockquote]:text-[#aab9ae]",

                                "[&_a]:break-all",
                                "[&_code]:break-all",
                            ].join(" ")}
                            dangerouslySetInnerHTML={{
                                __html: entry.content || "",
                            }}
                        />

                        {error && (
                            <div
                                className="mb-6 border-l-[3px] border-[#d7613c] bg-[#f8ded4] px-3.5 py-3 font-sans text-[13px] text-[#8d3d29] dark:bg-[#492b25] dark:text-[#f4b09a]"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <footer className="flex flex-col gap-5 border-t border-[#c9d1c7] pt-7 dark:border-[#405648] sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/diary")
                                }
                                className={actionClass}
                            >
                                ← Back to diary
                            </button>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                                <motion.button
                                    whileTap={{ scale: 0.92 }}
                                    type="button"
                                    onClick={handleStartEdit}
                                    className={`${actionClass} text-[#d7613c]`}
                                >
                                    Edit entry
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.92 }}
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className={`${actionClass} text-[#9aa59c]`}
                                >
                                    {deleting
                                        ? "Deleting..."
                                        : "Delete"}
                                </motion.button>
                            </div>
                        </footer>
                    </>
                )}
            </motion.article>
        </main>
    );
}
