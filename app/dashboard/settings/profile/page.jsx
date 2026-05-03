'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Loader2, CheckCircle2, AlertCircle, User, MapPin, FileText, AlignLeft, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import {enqueueSnackbar, useSnackbar} from 'notistack'

const VERTICALS = [
    { value: 'PROF_SERVICES', label: 'Professional Services' },
    { value: 'RETAIL', label: 'Retail' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'HEALTH', label: 'Health & Medical' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'FINANCE', label: 'Finance & Banking' },
    { value: 'FOOD_AND_GROCERY', label: 'Food & Grocery' },
    { value: 'OTHER', label: 'Other' },
];

function Toast({ message, type, onClose }) {
    return (
        <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300
                ${type === 'success'
                    ? 'bg-white dark:bg-[#111] border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400'
                    : 'bg-white dark:bg-[#111] border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
                }`}
        >
            {type === 'success'
                ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                : <AlertCircle className="w-4 h-4 shrink-0" />
            }
            {message}
            <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

function Field({ label, hint, children, required }) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {label}
                {required && <span className="text-rose-500">*</span>}
            </label>
            {children}
            {hint && <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
        </div>
    );
}

const inputBase =
    'w-full rounded-xl border bg-white dark:bg-white/[0.03] border-gray-200 dark:border-white/[0.07] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-gray-400 dark:focus:border-white/20 focus:ring-2 focus:ring-gray-200 dark:focus:ring-white/5 transition-all duration-150 resize-none';

export default function ProfileSettingsPage() {
    const fileRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null)
    const workspace = useSelector((state) => state.main.selectedWorkspace);
    const { enqueueSnackbar } = useSnackbar();
    const success_noti = (message)=> enqueueSnackbar(message, { variant: "success" });
    const error_noti = (message)=> enqueueSnackbar(message, { variant: "error" });



    const [form, setForm] = useState({
        name: '',
        about: '',
        description: '',
        address: '',
        email: '',
        website: '',
        vertical: '',
    });

    const [charCount, setCharCount] = useState({ about: 0, description: 0 });

 

    const handleChange = (field) => (e) => {
        const val = e.target.value;
        setForm((prev) => ({ ...prev, [field]: val }));
        if (field === 'about' || field === 'description') {
            setCharCount((prev) => ({ ...prev, [field]: val.length }));
        }
    };

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    }, []);

    const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const onDragLeave = () => setDragging(false);
const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
        const fd = new FormData();

        // Add workspace_id as a plain field
        fd.append('workspace_id', workspace?._id);

        // Add picture if selected
        if (imageFile) fd.append('picture', imageFile);

        // Add all text fields
        Object.entries(form).forEach(([k, v]) => {
            if (v) fd.append(k, v);
        });

        const res = await fetch('/api/setting/profile', {
            method: 'POST',
           
            body: fd,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save profile');
        success_noti('Profile updated successfully');
    } catch (err) {
        error_noti(err.message);
    } finally {
        setSaving(false);
    }
};
    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setSaving(true);
    //     try {
    //         const formData = new FormData();
    //         if (imageFile) formData.append('picture', imageFile);
    //         Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });

    //         const res = await fetch(`/api/setting/profile`, {
    //             method: 'POST',
    //             body: { formData: formData, workspace_id: workspace?._id },
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             }
    //         });

    //         const data = await res.json();
    //         if (!res.ok) throw new Error(data.error || 'Failed to save profile');
    //         success_noti('Profile updated successfully');
    //     } catch (err) {
    //         error_noti(err.message);
    //     } finally {
    //         setSaving(false);
    //     }
    // };

    return (
        <>
            <div className="p-6 sm:p-8  max-h-[calc(100vh-64px)] overflow-y-scroll">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Business Profile
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        This information appears on your WhatsApp Business profile visible to your customers.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Profile Picture */}
                    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl p-5">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
                            Profile Picture
                        </p>
                        <div className="flex items-center gap-5">
                            {/* Avatar preview */}
                            <div className="relative shrink-0">
                                <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden flex items-center justify-center">
                                    {preview ? (
                                        <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                    )}
                                </div>
                                {preview && (
                                    <button
                                        type="button"
                                        onClick={() => { setPreview(null); setImageFile(null); }}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                )}
                            </div>

                            {/* Drop zone */}
                            <div
                                onClick={() => fileRef.current?.click()}
                                onDrop={onDrop}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                className={`flex-1 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-xl py-5 cursor-pointer transition-all duration-150
                                    ${dragging
                                        ? 'border-gray-400 dark:border-white/30 bg-gray-50 dark:bg-white/5'
                                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                                    }`}
                            >
                                <Camera className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Click or drag to upload
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-600">PNG, JPG up to 5MB</p>
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFile(e.target.files[0])}
                            />
                        </div>
                    </div>

                    {/* Identity */}
                    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Identity
                        </p>

                        <Field label="Business Name" required>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600 pointer-events-none" />
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange('name')}
                                    placeholder="e.g. Acme Corp Support"
                                    className={`${inputBase} pl-10`}
                                    required
                                />
                            </div>
                        </Field>

                        <Field
                            label="About"
                            hint={`Short tagline shown under your name. ${charCount.about}/139 characters.`}
                        >
                            <input
                                type="text"
                                value={form.about}
                                onChange={handleChange('about')}
                                maxLength={139}
                                placeholder="e.g. Usually replies within minutes"
                                className={inputBase}
                            />
                        </Field>

                        <Field label="Business Category">
                            <select
                                value={form.vertical}
                                onChange={handleChange('vertical')}
                                className={`${inputBase} appearance-none`}
                            >
                                <option value="">Select a category</option>
                                {VERTICALS.map((v) => (
                                    <option key={v.value} value={v.value}>{v.label}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Description */}
                    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Description
                        </p>

                        <Field
                            label="Full Description"
                            hint={`Detailed info shown in your profile. ${charCount.description}/512 characters.`}
                        >
                            <div className="relative">
                                <AlignLeft className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-gray-600 pointer-events-none" />
                                <textarea
                                    value={form.description}
                                    onChange={handleChange('description')}
                                    maxLength={512}
                                    rows={4}
                                    placeholder="Tell customers what your business does, your hours, and what to expect..."
                                    className={`${inputBase} pl-10`}
                                />
                            </div>
                        </Field>
                    </div>

                    {/* Contact & Location */}
                    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Contact & Location
                        </p>

                        <Field label="Address">
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600 pointer-events-none" />
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={handleChange('address')}
                                    placeholder="e.g. F-7 Markaz, Islamabad, Pakistan"
                                    className={`${inputBase} pl-10`}
                                />
                            </div>
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Email">
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange('email')}
                                    placeholder="support@yourbusiness.com"
                                    className={inputBase}
                                />
                            </Field>

                            <Field label="Website" hint="Must start with https://">
                                <input
                                    type="url"
                                    value={form.website}
                                    onChange={handleChange('website')}
                                    placeholder="https://yourbusiness.com"
                                    className={inputBase}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-between pt-1">
                        <p className="text-xs text-gray-400 dark:text-gray-600">
                            Changes are pushed to your WhatsApp Business Profile via Cloud API.
                        </p>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shrink-0"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                'Save Profile'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}