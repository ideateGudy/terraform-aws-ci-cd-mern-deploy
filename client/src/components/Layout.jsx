import { AnimatePresence, motion } from "motion/react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useLogoutMutation } from "../store/apiSlice.js";
import { apiSlice } from "../store/apiSlice.js";
import { clearCredentials } from "../store/authSlice.js";

const navClass = ({ isActive }) =>
    `font-sans text-[13px] font-semibold transition-colors ${
        isActive
            ? "text-[#27352c] dark:text-[#f2f6f1]"
            : "text-[#718076] hover:text-[#27352c] dark:text-[#91a496] dark:hover:text-[#f2f6f1]"
    }`;

export default function Layout() {
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const [logout] = useLogoutMutation();
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem("theme") === "dark"
    );

    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const signOut = async () => {
        try {
            await logout().unwrap();
        } finally {
            dispatch(clearCredentials());
            dispatch(apiSlice.util.resetApiState());
        }

        navigate("/login");
    };

    const toggleDarkMode = () => {
        setDarkMode((value) => !value);
    };

    return (
        <div
            className="flex min-h-screen flex-col text-[#27352c] transition-colors dark:text-[#e8eee8]"
            style={{ background: "var(--app-background)" }}
        >
            <header className="mx-auto flex w-[min(1120px,calc(100%-32px))] items-center justify-between py-6 sm:w-[min(1120px,calc(100%-48px))] sm:py-8">
                <Link
                    to="/"
                    className="flex items-center gap-2.5 text-[18px] font-bold tracking-[.02em] dark:text-[#e8eee8]"
                >
                    <span className="h-3.5 w-3.5 rounded-full bg-[#e46e42] shadow-[7px_-4px_0_#b8cbb6]" />
                    little list
                </Link>

                {/* Mobile controls */}
                <div className="flex items-center gap-2 md:hidden">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        aria-label={
                            darkMode
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                        className="border-0 bg-transparent p-2 text-lg leading-none text-[#718076] dark:text-[#b8cbb6]"
                        onClick={toggleDarkMode}
                    >
                        {darkMode ? "☼" : "◐"}
                    </motion.button>

                    <button
                        type="button"
                        className="rounded-sm border border-[#c9d1c7] bg-transparent px-3 py-2 font-sans text-xs font-bold uppercase tracking-widest text-[#718076] dark:border-[#405648] dark:text-[#aab9ae]"
                        aria-expanded={menuOpen}
                        aria-controls="mobile-navigation"
                        onClick={() => setMenuOpen((value) => !value)}
                    >
                        {menuOpen ? "Close" : "Menu"}
                    </button>
                </div>

                {/* Desktop navigation */}
                <nav
                    className="hidden items-center gap-3 md:flex sm:gap-7"
                    aria-label="Main navigation"
                >
                    <NavLink to="/" end className={navClass}>
                        Home
                    </NavLink>

                    <NavLink to="/diary" className={navClass}>
                        Diary
                    </NavLink>

                    <NavLink to="/shortener" className={navClass}>
                        Shorten
                    </NavLink>

                    {user && (
                        <NavLink to="/profile" className={navClass}>
                            Profile
                        </NavLink>
                    )}

                    {user ? (
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            type="button"
                            className={`${navClass({
                                isActive: false,
                            })} border-0 bg-transparent p-0`}
                            onClick={signOut}
                        >
                            Sign out
                        </motion.button>
                    ) : (
                        <NavLink to="/login" className={navClass}>
                            Sign in
                        </NavLink>
                    )}

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        aria-label={
                            darkMode
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                        className="ml-1 border-0 bg-transparent p-1 text-[#718076] dark:text-[#b8cbb6]"
                        onClick={toggleDarkMode}
                    >
                        {darkMode ? "☼" : "◐"}
                    </motion.button>
                </nav>
            </header>

            {/* Mobile navigation */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.nav
                        id="mobile-navigation"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mx-auto flex w-[min(1120px,calc(100%-32px))] flex-col gap-4 overflow-hidden border-t border-[#c9d1c7] pb-5 pt-4 font-sans text-sm dark:border-[#405648] md:hidden sm:w-[min(1120px,calc(100%-48px))]"
                        aria-label="Mobile navigation"
                    >
                        <NavLink
                            to="/"
                            end
                            className={navClass}
                            onClick={() => setMenuOpen(false)}
                        >
                            Home
                        </NavLink>

                        <NavLink
                            to="/diary"
                            className={navClass}
                            onClick={() => setMenuOpen(false)}
                        >
                            Diary
                        </NavLink>

                        <NavLink
                            to="/shortener"
                            className={navClass}
                            onClick={() => setMenuOpen(false)}
                        >
                            Shorten
                        </NavLink>

                        {user && (
                            <NavLink
                                to="/profile"
                                className={navClass}
                                onClick={() => setMenuOpen(false)}
                            >
                                Profile
                            </NavLink>
                        )}

                        {user ? (
                            <button
                                type="button"
                                className={`${navClass({
                                    isActive: false,
                                })} w-fit border-0 bg-transparent p-0`}
                                onClick={signOut}
                            >
                                Sign out
                            </button>
                        ) : (
                            <NavLink
                                to="/login"
                                className={navClass}
                                onClick={() => setMenuOpen(false)}
                            >
                                Sign in
                            </NavLink>
                        )}
                    </motion.nav>
                )}
            </AnimatePresence>

            <motion.div
                className="flex flex-1 flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
            >
                <Outlet />
            </motion.div>

            <footer className="mx-auto flex w-[min(1120px,calc(100%-32px))] justify-between gap-3 py-7 font-sans text-[11px] uppercase tracking-[.08em] text-[#8b978d] dark:text-[#91a496] sm:w-[min(1120px,calc(100%-48px))]">
                <span>Little List</span>
                <span>Small steps, clearly seen.</span>
            </footer>
        </div>
    );
}
