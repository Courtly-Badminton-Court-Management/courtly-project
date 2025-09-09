"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import AuthHero from "@/ui/components/AuthHero";
import SplitPage from "@/ui/components/SplitPage";
import Field from "@/ui/components/Field";
import PrimaryButton from "@/ui/components/PrimaryButton";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
  remember: z.boolean().optional().default(false),
});

export default function LoginPage() {
  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange =
    (name: keyof typeof data) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as any).checked
          : e.target.value;
      setData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const fieldErrs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        fieldErrs[i.path.join(".")] = i.message;
      });
      setErrors(fieldErrs);
      return;
    }

    try {
      setLoading(true);
      // TODO: call API จริง
      alert("✅ Login success\n" + JSON.stringify(parsed.data, null, 2));
      // window.location.href = "/dashboard";
    } catch (err: any) {
      setFormError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
  try {
    setLoading(true);
    // TODO: Connect real Google OAuth
    alert("🔓 Google Sign-In clicked!");
    // window.location.href = "/dashboard";
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};



  const Right = (
    <>
      <h2 className="text-4xl md:text-4xl font-extrabold mb-5">
        <span className="text-pine">Welcome back!</span>{" "}
        <span className="text-walnut">Player!</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        )}

        <Field
          type="email"
          label="Email"
          name="email"
          placeholder="e.g. player@email.com"
          value={data.email}
          onChange={handleChange("email")}
          error={errors.email}
        />

        <div className="space-y-1">
          <Field
            type={showPwd ? "text" : "password"}
            label="Password"
            name="password"
            placeholder="Enter your password"
            value={data.password}
            onChange={handleChange("password")}
            error={errors.password}
          />

        </div>

        {/* <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.remember}
              onChange={handleChange("remember")}
              className="h-4 w-4 rounded border-muted-foreground/30"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div> */}

        <div className="flex items-center justify-between"></div>
        

        <PrimaryButton
          type="submit"
          disabled={loading}
          className="text-white"
          aria-busy={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </PrimaryButton>

        <PrimaryButton
          type="button"
          onClick={() => handleGoogleSignIn()}
          className="bg-smoke text-onyx"
        >
          <img
            src="/brand/google-icon.svg"
            alt="Google"
            className="h-5 w-5"
          />
          <span className="font-medium">Sign in with Google (optional)</span>
        </PrimaryButton>






        <p className="pt-2 text-center text-sm text-walnut">
          Don’t have an account?{" "}
          <Link href="/register" className="font-semibold text-sea underline">
            Create one
          </Link>
        </p>
      </form>
    </>
  );

  return <SplitPage heroPosition="left" formSide={Right} heroSide={<AuthHero side="right" />} />;
}
