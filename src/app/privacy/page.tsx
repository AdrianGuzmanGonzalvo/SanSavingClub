import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — SanSavingClub",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to SanSavingClub
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: August 2026</p>
      </div>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">Overview</h2>
          <p>
            SanSavingClub (&quot;we,&quot; &quot;our,&quot; &quot;the app&quot;) helps private groups organize a ROSCA / tanda —
            a rotating group savings circle. This policy explains what information we collect,
            why, and how it&apos;s handled. SanSavingClub does not process real payments or move
            money on your behalf; members report their contributions and a club leader tracks and
            approves them manually.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">Information we collect</h2>
          <p><strong className="text-foreground">Account information:</strong> your name, email address, phone number (optional), and a securely hashed password.</p>
          <p><strong className="text-foreground">Club and contribution data:</strong> the savings clubs you create or join, your payout turn, and the payment reports you submit — amount, date, payment method, an optional reference note, and an optional receipt image you choose to attach.</p>
          <p><strong className="text-foreground">Reputation data:</strong> statistics we compute from your payment history within the app (on-time payment rate, completed clubs) to show other members a trust indicator.</p>
          <p><strong className="text-foreground">Security data:</strong> if you enable two-factor authentication, a secret key and hashed backup codes used only to verify your sign-ins.</p>
          <p><strong className="text-foreground">Device/usage data:</strong> standard technical logs (IP address, browser type) collected automatically by our hosting provider for security and reliability, not for advertising.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">How we use this information</h2>
          <p>
            We use your information only to operate the app: creating and managing your clubs,
            tracking contributions and payout turns, sending you transactional emails (password
            resets, notifications about your clubs), and securing your account. We do not sell
            your data or use it for advertising.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">Who can see your information</h2>
          <p>
            Other members of a club you join can see what that club&apos;s settings allow — by
            default your name, payout turn, and payout date, but a club&apos;s leader can restrict
            this. A club&apos;s leader can always see the full payment history and member list for
            clubs they administer. We never share your information with anyone outside your own
            clubs.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">Third-party services</h2>
          <p>
            We use a small number of service providers to run the app: a database host to store
            your data, an email service to deliver transactional emails, and a hosting platform to
            serve the website and app. These providers process data only on our behalf and don&apos;t
            use it for their own purposes.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">Your choices</h2>
          <p>
            You can update or delete your account information, or ask us to delete your data
            entirely, by contacting us at{" "}
            <a href="mailto:help@sansavingclub.com" className="text-foreground underline">
              help@sansavingclub.com
            </a>
            . Deleting your account removes your personal information; historical club records
            other members rely on may be retained in anonymized form.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">Children&apos;s privacy</h2>
          <p>SanSavingClub is not directed at children under 13, and we don&apos;t knowingly collect information from them.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">Changes to this policy</h2>
          <p>If we make material changes to this policy, we&apos;ll update the date above and, where appropriate, notify you in the app.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">Contact</h2>
          <p>
            Questions about this policy? Email{" "}
            <a href="mailto:help@sansavingclub.com" className="text-foreground underline">
              help@sansavingclub.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
