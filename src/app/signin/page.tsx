import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { SignInForm } from "@/components/forms/SignInForm";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      quote={
        <>
          Data should become trusted because it has been <span className="hi">verified</span>, not because it was displayed.
        </>
      }
    >
      <SignInForm />
    </AuthShell>
  );
}
