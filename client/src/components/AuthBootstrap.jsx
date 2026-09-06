import { useEffect } from "react";
import { motion } from "motion/react";
import { useDispatch } from "react-redux";

import { useRefreshMutation } from "../store/apiSlice.js";
import {
clearCredentials,
setCredentials,
} from "../store/authSlice.js";

export default function AuthBootstrap({ children }) {
const dispatch = useDispatch();

const [refresh, { isLoading }] = useRefreshMutation();

useEffect(() => {
    refresh()
        .unwrap()
        .then((data) => {
            dispatch(setCredentials(data));
        })
        .catch(() => {
            dispatch(clearCredentials());
        });
}, [dispatch, refresh]);

if (!isLoading) {
    return children;
}

return (
    <main className="relative flex min-h-dvh flex-1 items-center justify-center overflow-hidden bg-[#f7f5ee] px-5 dark:bg-[#18221c]">
        {/* Ambient background */}
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 1.2,
                    ease: "easeOut",
                }}
                className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#d7613c]/5.5 blur-3xl"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 1.4,
                    delay: 0.15,
                    ease: "easeOut",
                }}
                className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[#718076]/[0.07] blur-3xl"
            />
        </div>

        {/* Loading card */}
        <motion.section
            initial={{
                opacity: 0,
                y: 12,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.45,
                ease: "easeOut",
            }}
            className="relative w-full max-w-sm"
        >
            <div className="border border-[#c9d1c7] bg-[#fffdf8]/80 px-7 py-9 shadow-[0_18px_60px_rgba(39,53,44,0.06)] backdrop-blur-sm dark:border-[#405648] dark:bg-[#203027]/80 dark:shadow-black/10">
                {/* Small mark */}
                <div className="flex justify-center">
                    <div className="relative flex h-12 w-12 items-center justify-center">
                        <motion.div
                            animate={{
                                rotate: 360,
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="absolute inset-0 rounded-full border border-[#c9d1c7] border-t-[#d7613c] dark:border-[#405648] dark:border-t-[#d7613c]"
                        />

                        <span className="font-serif text-lg italic text-[#d7613c]">
                            d
                        </span>
                    </div>
                </div>

                {/* Text */}
                <div className="mt-7 text-center">
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[.18em] text-[#d7613c]">
                        One moment
                    </p>

                    <h1 className="mt-3 text-[28px] font-normal tracking-tight text-[#27352c] dark:text-[#f2f6f1]">
                        Opening your space.
                    </h1>

                    <p className="mx-auto mt-3 max-w-67.5 text-[14px] leading-[1.6] text-[#718076] dark:text-[#aab9ae]">
                        Checking your session and getting
                        everything ready.
                    </p>
                </div>

                {/* Progress */}
                <div className="mt-8">
                    <div className="h-px overflow-hidden bg-[#dfe3dc] dark:bg-[#405648]">
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="h-full w-1/2 bg-[#d7613c]"
                        />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <span className="font-sans text-[9px] uppercase tracking-[.12em] text-[#9aa59c]">
                            Secure session
                        </span>

                        <motion.span
                            animate={{ opacity: [0.35, 1, 0.35] }}
                            transition={{
                                duration: 1.6,
                                repeat: Infinity,
                            }}
                            className="font-sans text-[9px] uppercase tracking-[.12em] text-[#9aa59c]"
                        >
                            Checking
                        </motion.span>
                    </div>
                </div>
            </div>

            {/* Footer note */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    delay: 0.6,
                    duration: 0.5,
                }}
                className="mt-5 text-center font-sans text-[9px] uppercase tracking-[.14em] text-[#9aa59c]"
            >
                Your pages stay private
            </motion.p>
        </motion.section>
    </main>
);


}