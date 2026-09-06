import { Link } from "react-router";
import { motion } from "motion/react";

export default function NotFoundPage() {
    return <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mx-auto flex w-[min(1120px,calc(100%-32px))] flex-1 flex-col items-start py-[15vh] sm:w-[min(1120px,calc(100%-48px))]"><p className="mb-4.5 font-sans text-[11px] font-bold uppercase tracking-[.14em] text-[#d7613c]">404</p><h1 className="mb-7 text-[clamp(44px,7vw,80px)] leading-none tracking-[-.045em] dark:text-[#f2f6f1]">That page wandered off.</h1><Link to="/" className="font-sans text-[13px] font-bold text-[#d7613c]">Back home -&gt;</Link></motion.main>;
}