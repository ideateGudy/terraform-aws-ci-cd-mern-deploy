import { motion } from "motion/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useLoginMutation, useRegisterMutation } from "../store/apiSlice.js";
import { setCredentials } from "../store/authSlice.js";

const inputClass = "w-full rounded-sm border border-[#c9d1c7] bg-[#fffdf8]/55 px-[15px] py-[14px] text-[#27352c] outline-none placeholder:text-[#9aa59c] focus:border-[#d7613c] dark:border-[#405648] dark:bg-[#203027]/70 dark:text-[#edf4ee] dark:placeholder:text-[#819687]";

export default function AuthPage({ register = false }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [login, { isLoading: loginLoading }] = useLoginMutation();
    const [registerUser, { isLoading: registerLoading }] = useRegisterMutation();
    const { register: registerField, handleSubmit, formState: { errors } } = useForm({ defaultValues: { name: "", email: "", password: "" } });

    const submit = async (values) => {
        setSubmitting(true); setError("");
        try {
            const data = await (register ? registerUser(values) : login({ email: values.email, password: values.password })).unwrap();
            dispatch(setCredentials(data)); navigate("/diary");
        } catch (authError) { setError(authError.data?.error || authError.message || "Unable to authenticate"); }
        finally { setSubmitting(false); }
    };

    return <main className="mx-auto flex w-[min(1120px,calc(100%-32px))] flex-1 items-start py-[8vh] sm:w-[min(1120px,calc(100%-48px))]">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }} className="mx-auto w-full max-w-120 border-t border-[#c9d1c7] pt-7 dark:border-[#405648]">
            <p className="mb-4.5 font-sans text-[11px] font-bold uppercase tracking-[.14em] text-[#d7613c]">{register ? "Start simply" : "Welcome back"}</p>
            <h1 className="mb-8 text-[clamp(40px,6vw,68px)] font-normal leading-[.98] tracking-[-.045em] dark:text-[#f2f6f1]">{register ? "Create your list." : "Pick up where you left off."}</h1>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit(submit)} noValidate>
                {register && <Field error={errors.name?.message}><input className={inputClass} {...registerField("name", { required: "Your name is required", validate: (value) => value.trim() ? true : "Your name is required" })} placeholder="Your name" aria-label="Your name" /></Field>}
                <Field error={errors.email?.message}><input className={inputClass} type="email" {...registerField("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" } })} placeholder="Email address" aria-label="Email address" /></Field>
                <Field error={errors.password?.message}><input className={inputClass} type="password" {...registerField("password", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })} placeholder="Password (8+ characters)" aria-label="Password" /></Field>
                    {error && <div className="border-l-[3px] border-[#d7613c] bg-[#f8ded4] px-3.5 py-3 font-sans text-[13px] text-[#8d3d29] dark:bg-[#492b25] dark:text-[#f4b09a]" role="alert">{error}</div>}
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: .98 }} type="submit" className="mt-2 rounded-sm border-0 bg-[#27352c] px-5.25 py-3.75 font-sans text-[12px] font-bold tracking-[.03em] text-[#fffdf8] hover:bg-[#d7613c]" disabled={submitting || loginLoading || registerLoading}>{submitting ? "Please wait..." : register ? "Create account" : "Sign in"}</motion.button>
            </form>
            <p className="font-sans text-[13px] text-[#718076]">{register ? "Already have an account?" : "New to Little List?"} <Link className="font-bold text-[#d7613c]" to={register ? "/login" : "/register"}>{register ? "Sign in" : "Create one"}</Link></p>
        </motion.section>
    </main>;
}

function Field({ error, children }) {
    return <div>{children}{error && <span className="mt-1 block font-sans text-[11px] leading-[1.3] text-[#b54f32] dark:text-[#f09a78]">{error}</span>}</div>;
}
