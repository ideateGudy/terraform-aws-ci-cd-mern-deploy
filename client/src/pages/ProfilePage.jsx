import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import AuthPage from "./AuthPage.jsx";
import { useGetProfileQuery, useUpdateProfileMutation } from "../store/apiSlice.js";
import { setUser } from "../store/authSlice.js";

const inputClass = "w-full rounded-sm border border-[#c9d1c7] bg-[#fffdf8]/55 px-4 py-3.5 text-[#27352c] outline-none placeholder:text-[#9aa59c] focus:border-[#d7613c] dark:border-[#405648] dark:bg-[#203027]/70 dark:text-[#edf4ee] dark:placeholder:text-[#819687]";

export default function ProfilePage() {
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const { data, isLoading } = useGetProfileQuery(undefined, { skip: !user });
    const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
    const [serverError, setServerError] = useState("");
    const [saved, setSaved] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { name: "", email: "" } });

    useEffect(() => {
        if (data?.user) reset(data.user);
    }, [data, reset]);

    if (!user) return <AuthPage />;

    const submit = async (values) => {
        try {
            setServerError("");
            setSaved(false);
            const response = await updateProfile({ name: values.name.trim(), email: values.email.trim() }).unwrap();
            dispatch(setUser(response.user));
            reset(response.user);
            setSaved(true);
        } catch (error) {
            setServerError(error.data?.error || "Unable to update your profile.");
        }
    };

    return <main className="mx-auto flex w-[min(1120px,calc(100%-32px))] flex-1 items-start py-[8vh] sm:w-[min(1120px,calc(100%-48px))]">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-155 border-t border-[#c9d1c7] pt-7 dark:border-[#405648]">
            <p className="mb-4.5 font-sans text-[11px] font-bold uppercase tracking-[.14em] text-[#d7613c]">Your details</p>
            <h1 className="mb-3 text-[clamp(44px,6vw,76px)] leading-[.95] tracking-[-.045em] dark:text-[#f2f6f1]">Make it yours.</h1>
            <p className="mb-8 max-w-105 text-[17px] leading-[1.45] text-[#718076] dark:text-[#aab9ae]">Keep your Little List identity current.</p>
            {isLoading ? <p className="text-[#718076] dark:text-[#aab9ae]">Loading your profile...</p> : <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3" noValidate>
                <div><label className="mb-2 block font-sans text-[11px] font-bold uppercase tracking-widest text-[#718076] dark:text-[#aab9ae]" htmlFor="profile-name">Name</label><input id="profile-name" className={inputClass} {...register("name", { required: "Your name is required", validate: (value) => value.trim() ? true : "Your name is required" })} aria-invalid={Boolean(errors.name)} />{errors.name && <span className="mt-1 block font-sans text-[11px] text-[#b54f32] dark:text-[#f09a78]">{errors.name.message}</span>}</div>
                <div><label className="mb-2 block font-sans text-[11px] font-bold uppercase tracking-widest text-[#718076] dark:text-[#aab9ae]" htmlFor="profile-email">Email</label><input id="profile-email" className={inputClass} type="email" {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" } })} aria-invalid={Boolean(errors.email)} />{errors.email && <span className="mt-1 block font-sans text-[11px] text-[#b54f32] dark:text-[#f09a78]">{errors.email.message}</span>}</div>
                {serverError && <div className="border-l-[3px] border-[#d7613c] bg-[#f8ded4] px-3.5 py-3 font-sans text-[13px] text-[#8d3d29] dark:bg-[#492b25] dark:text-[#f4b09a]" role="alert">{serverError}</div>}
                <div className="mt-2 flex items-center gap-4"><motion.button whileHover={{ y: -2 }} whileTap={{ scale: .98 }} type="submit" className="rounded-sm border-0 bg-[#27352c] px-5 py-3.5 font-sans text-xs font-bold text-[#fffdf8] hover:bg-[#d7613c] disabled:opacity-60" disabled={saving}>{saving ? "Saving..." : "Save changes"}</motion.button>{saved && <span className="font-sans text-xs text-[#5d8568] dark:text-[#9bd0a7]">Profile updated.</span>}</div>
            </form>}
        </motion.section>
    </main>;
}
