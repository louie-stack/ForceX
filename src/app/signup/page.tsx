import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { SignUpForm } from "@/components/forms/SignUpForm";

export const metadata: Metadata = {
  title: "Create your ForceX account",
  robots: { index: false, follow: false },
};

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const { return_to } = await searchParams;
  const safe = return_to && /^\/(?!\/)/.test(return_to) ? return_to : undefined;
  return (
    <AuthShell
      eyebrow="Public beta is open"
      quote={
        <>
          Verified Litecoin data, the explorer, analytics, watchlists, and API keys. <span className="hi">Free</span> to start.
        </>
      }
    >
      <SignUpForm returnTo={safe} />
    </AuthShell>
  );
}
