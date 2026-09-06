import { motion } from "motion/react";
import { Link } from "react-router";

const reveal = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: .08 } } };

export default function HomePage() {
    return (
        <main className="mx-auto w-[min(1120px,calc(100%-32px))] flex-1 py-[8vh] sm:w-[min(1120px,calc(100%-48px))] sm:py-[5vh]">
            <section className="grid min-h-0 items-center gap-14 lg:min-h-[62vh] lg:grid-cols-[minmax(0,1fr)_minmax(360px,.8fr)] lg:gap-[clamp(48px,10vw,150px)]">
                <motion.div variants={stagger} initial="hidden" animate="show" className="pb-0 lg:pb-[3vh]">
                    <motion.p variants={reveal} className="mb-4.5 font-sans text-[11px] font-bold uppercase tracking-[.14em] text-[#d7613c]">Your small corner of the internet</motion.p>
                    <motion.h1 variants={reveal} className="m-0 text-[clamp(56px,8vw,106px)] leading-[.92] tracking-[-.045em] dark:text-[#f2f6f1]">Keep it<br /><em className="text-[#d7613c]">together.</em></motion.h1>
                    <motion.p variants={reveal} className="my-8 max-w-105 text-[19px] leading-[1.45] text-[#718076] dark:text-[#aab9ae]">Little List gives your everyday thoughts a calm place to land, plus lighter links to share.</motion.p>
                    <motion.div variants={reveal} className="flex items-center gap-6">
                        <motion.div whileHover={{ y: -3 }} whileTap={{ scale: .97 }}><Link to="/diary" className="inline-block rounded-sm bg-[#27352c] px-[21px] py-[15px] font-sans text-[12px] font-bold tracking-[.03em] text-[#fffdf8] transition-colors hover:bg-[#d7613c]">Open diary <span className="ml-4" aria-hidden="true">-&gt;</span></Link></motion.div>
                        <Link to="/shortener" className="font-sans text-[12px] font-bold text-[#d7613c] after:ml-2 after:content-['->']">Shorten a link</Link>
                    </motion.div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 24, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 2 }} transition={{ duration: .8, delay: .25 }} whileHover={{ y: -7, rotate: 1 }} className="relative min-h-87.5 overflow-hidden border border-[#b9c8b8] bg-[#dfe9dc] p-5 shadow-[14px_16px_0_rgba(39,53,44,.08)] dark:border-[#405648] dark:bg-[#26382e] dark:shadow-[14px_16px_0_rgba(0,0,0,.2)] lg:min-h-97.5" aria-label="Little List feature preview">
                    <div className="flex justify-between border-b border-[#b9c8b8] pb-3.5 font-sans text-[10px] uppercase tracking-[.08em] text-[#718076] dark:border-[#405648] dark:text-[#aab9ae]"><span>little list / workspace</span><span>02 tools</span></div>
                    <PreviewSection index="01" label="Today" title="Three things worth doing."><span className="flex items-center gap-2 font-sans text-xs"><i className="h-2.5 w-2.5 rounded-full border border-[#d7613c]" />Finish the first draft</span><span className="flex items-center gap-2 font-sans text-xs text-[#8b978d]"><i className="h-2.5 w-2.5 rounded-full border border-[#d7613c]" />Send the short version</span></PreviewSection>
                    <PreviewSection index="02" label="Share simply" title="One link, less clutter."><span className="font-sans text-xs tracking-[.04em] text-[#d7613c]">littlelist / r / bright-idea</span></PreviewSection>
                    <span className="absolute bottom-3.5 right-6 text-[38px] font-extralight text-[#d7613c]" aria-hidden="true">+</span>
                </motion.div>
            </section>
            <motion.section variants={stagger} initial="hidden" animate="show" className="mt-14 grid border-t border-[#c9d1c7] dark:border-[#405648] lg:grid-cols-3" aria-label="Little List tools">
                <motion.div variants={reveal} className="min-h-37.5 py-5 pr-6"><p className="mb-4.5 font-sans text-[11px] font-bold uppercase tracking-[.14em] text-[#d7613c]">Two useful habits</p><p className="m-0 text-[21px] leading-[1.15] text-[#718076] dark:text-[#aab9ae]">Make progress visible.<br />Make sharing easier.</p></motion.div>
                <ToolLink to="/diary" number="01" title="Diary" text="Keep the thought close." />
                <ToolLink to="/shortener" number="02" title="Short links" text="Turn long addresses into clean shares." />
            </motion.section>
        </main>
    );
}

function PreviewSection({ index, label, title, children }) {
    return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index === "01" ? .55 : .7 }} className="grid grid-cols-[32px_1fr] gap-4 border-t border-[#b9c8b8] px-1 py-7 first:border-t-0 dark:border-[#405648]"><span className="font-sans text-[11px] font-bold text-[#d7613c]">{index}</span><div className="flex flex-col gap-3"><span className="font-sans text-[10px] font-bold uppercase tracking-[.12em] text-[#718076] dark:text-[#aab9ae]">{label}</span><strong className="text-[26px] font-normal tracking-[-.02em] dark:text-[#f2f6f1]">{title}</strong>{children}</div></motion.div>;
}

function ToolLink({ to, number, title, text }) {
    return <motion.div variants={reveal} whileHover={{ x: 5 }}><Link to={to} className="grid min-h-37.5 grid-cols-[32px_1fr_24px] items-start gap-4 border-t border-[#c9d1c7] py-5 dark:border-[#405648] lg:border-l lg:border-t-0 lg:pl-6"><span className="font-sans text-[11px] font-bold text-[#d7613c]">{number}</span><span className="flex flex-col gap-2.5"><strong className="text-2xl font-normal dark:text-[#f2f6f1]">{title}</strong><span className="text-sm leading-[1.3] text-[#718076] dark:text-[#aab9ae]">{text}</span></span><span className="text-[22px] text-[#d7613c]" aria-hidden="true">&#8599;</span></Link></motion.div>;
}
