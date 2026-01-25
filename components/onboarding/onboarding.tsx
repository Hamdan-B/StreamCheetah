"use client";

import { useDatabase } from "@/contexts/databaseContext";
import { useSupabaseAuth } from "@/lib/supabaseAuth";
import React, { useCallback, useEffect, useState } from "react";

type OnboardingProps = {
  onComplete?: () => void;
};

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [form, setForm] = useState({
    userName: "",
    mail: "",
    dateOfBirth: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const { user } = useSupabaseAuth();
  const { setUserData, supabase } = useDatabase();

  useEffect(() => {
    const email = user?.email;
    if (email && form.mail === "") {
      setForm({
        ...form,
        mail: email,
      });
    }
  }, [user, form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAvatarFile(file ?? null);
    setAvatarPreview(file ? URL.createObjectURL(file) : "");
  };

  const submitUserData = useCallback(async () => {
    const userId = user?.id;
    if (!userId) {
      console.log("User ID not found");
      return;
    }
    if (!supabase) {
      console.log("Supabase client not ready");
      return;
    }
    if (!avatarFile) {
      console.log("Please select a profile image");
      return;
    }

    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading avatar", uploadError.message);
      return;
    }

    const { data: publicData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = publicData?.publicUrl ?? "";
    const result = await setUserData(
      form.userName,
      publicUrl,
      form.mail,
      form.dateOfBirth,
      userId,
    );
    if (!result) {
      console.log("User data not set");
      return;
    }
    console.log("User data set successfully");
    setIsOpen(false);
    onComplete?.();
  }, [form, user, setUserData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitUserData();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
      <div className="bg-background text-foreground rounded-lg shadow-lg p-8 w-full max-w-md relative border border-muted">
        <button
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-2xl"
          onClick={() => setIsOpen(false)}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Onboarding</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="userName"
              className="block text-sm font-medium mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={form.userName}
              onChange={handleChange}
              required
              className="w-full rounded px-3 py-2 border border-muted bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium mb-1">
              Profile Image (upload)
            </label>
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full rounded px-3 py-2 border border-muted bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {avatarPreview && (
              <div className="mt-3 flex items-center gap-2">
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <p className="text-xs text-muted-foreground">Preview</p>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="mail" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="mail"
              name="mail"
              value={form.mail}
              onChange={handleChange}
              required
              disabled={form.mail !== ""}
              className={`w-full rounded px-3 py-2 border border-muted bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                form.mail !== "" ? "bg-muted/30 opacity-70" : ""
              }`}
            />
          </div>
          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium mb-1"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full rounded px-3 py-2 border border-muted bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 rounded font-semibold hover:bg-primary/90 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
