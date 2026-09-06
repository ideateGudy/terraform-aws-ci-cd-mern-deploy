import { motion } from "motion/react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import AuthPage from "./AuthPage.jsx";
import { useCreateShortUrlMutation, useDeleteShortUrlMutation, useGetShortUrlsQuery } from "../store/apiSlice.js";

const inputClass = "w-full rounded-sm border border-[#c9d1c7] bg-[#fffdf8]/55 px-4 py-4 text-[#27352c] outline-none placeholder:text-[#9aa59c] focus:border-[#d7613c] dark:border-[#405648] dark:bg-[#203027]/70 dark:text-[#edf4ee] dark:placeholder:text-[#819687]";

export default function ShortenerPage() {
    const user = useSelector((state) => state.auth.user);
    const [copied, setCopied] = useState("");
    const [error, setError] = useState("");
    const { data: links = [], isLoading } = useGetShortUrlsQuery(user?.id, { skip: !user });
    const [createShortUrl, { isLoading: creating }] = useCreateShortUrlMutation();
    const [deleteShortUrl, { isLoading: deleting }] = useDeleteShortUrlMutation();
    const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { originalUrl: "" } });
    if (!user) return <AuthPage />;
    const submit = async (values) => { try { setError(""); await createShortUrl({ originalUrl: values.originalUrl.trim() }).unwrap(); reset(); } catch (e) { setError(e.data?.error || "Unable to shorten that URL."); } };
    const copyLink = async (shortUrl) => { await navigator.clipboard.writeText(shortUrl); setCopied(shortUrl); window.setTimeout(() => setCopied(""), 1800); };
    const removeLink = async (id) => { try { setError(""); await deleteShortUrl(id).unwrap(); } catch (e) { setError(e.data?.error || "Unable to delete that short link."); } };

    return <main className="mx-auto w-[min(1120px,calc(100%-32px))] flex-1 py-[8vh] sm:w-[min(1120px,calc(100%-48px))]">
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-between gap-6 border-b border-[#c9d1c7] pb-7 dark:border-[#405648] sm:flex-row sm:items-end"><div><p className="mb-4.5 font-sans text-[11px] font-bold uppercase tracking-[.14em] text-[#d7613c]">A smaller internet</p><h1 className="text-[clamp(48px,7vw,88px)] leading-[.9] tracking-[-.045em] dark:text-[#f2f6f1]">Make links<br /><em className="text-[#d7613c]">lighter.</em></h1></div><p className="mb-1 max-w-70 text-[18px] leading-[1.45] text-[#718076] dark:text-[#aab9ae]">Turn long addresses into simple links you can share, remember, and keep close.</p></motion.section>
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} className="mx-auto mt-9 max-w-215">
            <form className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit(submit)} noValidate><div className="min-w-0 flex-1"><label className="mb-2 block font-sans text-[11px] font-bold uppercase tracking-widest text-[#718076]" htmlFor="original-url">Paste a long URL</label><input id="original-url" className={inputClass} type="url" {...register("originalUrl", { required: "A URL is required.", pattern: { value: /^https?:\/\/\S+$/i, message: "Use a valid HTTP or HTTPS URL." } })} placeholder="https://example.com/a-very-long-link" disabled={creating} />{errors.originalUrl && <span className="mt-1 block font-sans text-[11px] text-[#b54f32]">{errors.originalUrl.message}</span>}</div><motion.button whileHover={{ y: -2 }} whileTap={{ scale: .98 }} type="submit" className="rounded-sm border-0 bg-[#27352c] px-5 py-4 font-sans text-xs font-bold text-[#fffdf8] hover:bg-[#d7613c] disabled:cursor-wait disabled:opacity-60" disabled={creating}>{creating ? "Shortening..." : "Shorten link"}</motion.button></form>
            {error && <div className="mt-4 border-l-[3px] border-[#d7613c] bg-[#f8ded4] px-3.5 py-3 font-sans text-[13px] text-[#8d3d29] dark:bg-[#492b25] dark:text-[#f4b09a]" role="alert">{error}</div>}
            <div className="mt-11 border-t border-[#c9d1c7] dark:border-[#405648]">{isLoading ? <p className="py-14 text-[#718076] dark:text-[#aab9ae]">Loading your links...</p> : links.length === 0 ? <div className="flex flex-col gap-1.5 py-14 text-[#718076] dark:text-[#aab9ae]"><strong className="text-2xl font-normal text-[#27352c] dark:text-[#f2f6f1]">No short links yet.</strong><span>Your next share can start here.</span></div> : links.map((link, index) => <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} className="flex flex-col items-start justify-between gap-3 border-b border-[#c9d1c7] py-5 dark:border-[#405648] sm:flex-row sm:items-center sm:gap-6" key={link.id}><div className="flex min-w-0 flex-col gap-1.5"><a className="truncate text-[21px] text-[#d7613c]" href={link.shortUrl} target="_blank" rel="noreferrer">{link.shortUrl}</a><span className="max-w-150 truncate font-sans text-xs text-[#8b978d] dark:text-[#91a496]">{link.originalUrl}</span></div><div className="flex w-full shrink-0 items-center justify-between gap-4.5 font-sans text-[11px] uppercase tracking-[.08em] text-[#8b978d] dark:text-[#91a496] sm:w-auto"><span>{link.clicks} {link.clicks === 1 ? "click" : "clicks"}</span><div className="flex items-center gap-4"><motion.button whileTap={{ scale: .92 }} type="button" className="border-0 bg-transparent p-0 font-sans text-[11px] uppercase tracking-[.08em] text-[#718076] hover:text-[#d7613c] dark:text-[#aab9ae]" onClick={() => copyLink(link.shortUrl)}> {copied === link.shortUrl ? "Copied" : "Copy"}</motion.button><motion.button whileTap={{ scale: .92 }} type="button" className="border-0 bg-transparent p-0 font-sans text-[11px] uppercase tracking-[.08em] text-[#9aa59c] hover:text-[#d7613c]" onClick={() => removeLink(link.id)} disabled={deleting} aria-label={`Delete ${link.shortUrl}`}>{deleting ? "Deleting..." : "Delete"}</motion.button></div></div></motion.article>)}</div>
        </motion.section>
    </main>;
}
