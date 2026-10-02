import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/content/site";
import { contentAlternates } from "@/lib/content-routes";
import type { Locale } from "@/lib/i18n/locale";

const META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Privacy Policy",
    description:
      "What information SanSavingClub collects, how it's used and who can see it, including advertising and cookies.",
  },
  es: {
    title: "Política de privacidad",
    description:
      "Qué información recopila SanSavingClub, cómo se usa y quién puede verla, incluida la publicidad y las cookies.",
  },
};

export function privacyMetadata(locale: Locale): Metadata {
  return { ...META[locale], alternates: contentAlternates(locale, "/privacy") };
}

export function PrivacyView({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      {locale === "es" ? <PrivacyEs /> : <PrivacyEn />}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="text-foreground">{children}</strong>;
}

function ExternalLink({ href }: { href: string }) {
  return (
    <a href={href} className="text-foreground underline" target="_blank" rel="noopener noreferrer">
      {href.replace("https://", "")}
    </a>
  );
}

function Email() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground underline">
      {CONTACT_EMAIL}
    </a>
  );
}

function PrivacyEn() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: October 2026</p>
      </div>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
        <Section title="Overview">
          <p>
            SanSavingClub (&quot;we,&quot; &quot;our,&quot; &quot;the app&quot;) helps private groups organize a ROSCA / tanda —
            a rotating group savings circle. This policy explains what information we collect,
            why, and how it&apos;s handled. SanSavingClub does not process real payments or move
            money on your behalf; members report their contributions and a club leader tracks and
            approves them manually.
          </p>
        </Section>

        <Section title="Information we collect">
          <p><Strong>Account information:</Strong> your name, email address, phone number (optional), and a securely hashed password.</p>
          <p><Strong>Club and contribution data:</Strong> the savings clubs you create or join, your payout turn, and the payment reports you submit — amount, date, payment method, an optional reference note, and an optional receipt image you choose to attach.</p>
          <p><Strong>Reputation data:</Strong> statistics we compute from your payment history within the app (on-time payment rate, completed clubs) to show other members a trust indicator.</p>
          <p><Strong>Security data:</Strong> if you enable two-factor authentication, a secret key and hashed backup codes used only to verify your sign-ins.</p>
          <p><Strong>Device/usage data:</Strong> standard technical logs (IP address, browser type) collected automatically by our hosting provider for security and reliability. See &quot;Advertising and cookies&quot; below for what our advertising partners separately collect.</p>
        </Section>

        <Section title="How we use this information">
          <p>
            We use your information to operate the app: creating and managing your clubs,
            tracking contributions and payout turns, sending you transactional emails (password
            resets, notifications about your clubs), and securing your account. We do not sell
            your personal information. The website and app do show advertising provided by
            Google — see &quot;Advertising and cookies&quot; below for what that involves.
          </p>
        </Section>

        <Section title="Who can see your information">
          <p>
            Other members of a club you join can see what that club&apos;s settings allow — by
            default your name, payout turn, and payout date, but a club&apos;s leader can restrict
            this. A club&apos;s leader can always see the full payment history and member list for
            clubs they administer. We never share your information with anyone outside your own
            clubs.
          </p>
        </Section>

        <Section title="Third-party services">
          <p>
            We use a small number of service providers to run the app: a database host to store
            your data, an email service to deliver transactional emails, and a hosting platform to
            serve the website and app. These providers process data only on our behalf and don&apos;t
            use it for their own purposes.
          </p>
        </Section>

        <Section title="Advertising and cookies">
          <p>
            SanSavingClub is supported in part by advertising. Our website uses Google AdSense,
            and our mobile app uses Google AdMob, to show ads. To do this, Google and its
            advertising partners may use cookies (on the website) or your device&apos;s
            advertising identifier (in the app), together with your IP address and general device
            information, to serve ads and measure their performance — and, where you&apos;ve
            given consent, to personalize the ads you see.
          </p>
          <p>
            For this purpose Google acts independently, not simply on our behalf, and uses this
            data under its own privacy policy. You can read how Google uses data from sites and
            apps that use its services at{" "}
            <ExternalLink href="https://policies.google.com/technologies/partner-sites" />, and Google&apos;s own
            Privacy Policy at <ExternalLink href="https://policies.google.com/privacy" />.
          </p>
          <p>
            If you&apos;re in the European Economic Area, the UK, or Switzerland, a consent
            banner lets you choose whether to allow personalized ads the first time you visit the
            website; you can change that choice anytime from the banner&apos;s settings link. In
            the mobile app, you can review or change your ad consent choice from{" "}
            <Strong>Profile → Ad privacy options</Strong>.
          </p>
        </Section>

        <Section title="Your choices">
          <p>
            You can update or delete your account information, or ask us to delete your data
            entirely, by contacting us at <Email />. Deleting your account removes your personal
            information; historical club records other members rely on may be retained in
            anonymized form.
          </p>
        </Section>

        <Section title="Children's privacy">
          <p>SanSavingClub is not directed at children under 13, and we don&apos;t knowingly collect information from them.</p>
        </Section>

        <Section title="Changes to this policy">
          <p>If we make material changes to this policy, we&apos;ll update the date above and, where appropriate, notify you in the app.</p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy? Email <Email />.
          </p>
        </Section>
      </div>
    </>
  );
}

// Translation of PrivacyEn. Keep the two in step when either one changes.
function PrivacyEs() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Política de privacidad</h1>
        <p className="text-sm text-muted-foreground">Última actualización: octubre de 2026</p>
      </div>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
        <Section title="Resumen">
          <p>
            SanSavingClub («nosotros», «la app») ayuda a grupos privados a organizar un san o
            tanda (ROSCA): un círculo rotativo de ahorro grupal. Esta política explica qué
            información recopilamos, por qué y cómo se maneja. SanSavingClub no procesa pagos
            reales ni mueve dinero en tu nombre; los miembros reportan sus aportes y el líder del
            club los revisa y aprueba manualmente.
          </p>
        </Section>

        <Section title="Información que recopilamos">
          <p><Strong>Información de la cuenta:</Strong> tu nombre, correo electrónico, número de teléfono (opcional) y una contraseña almacenada como hash seguro.</p>
          <p><Strong>Datos de clubes y aportes:</Strong> los clubes de ahorro que creas o a los que te unes, tu turno de entrega y los reportes de pago que envías: monto, fecha, método de pago, una nota de referencia opcional y una imagen de comprobante opcional que decidas adjuntar.</p>
          <p><Strong>Datos de reputación:</Strong> estadísticas que calculamos a partir de tu historial de pagos dentro de la app (porcentaje de pagos a tiempo, clubes completados) para mostrar a otros miembros un indicador de confianza.</p>
          <p><Strong>Datos de seguridad:</Strong> si activas la verificación en dos pasos, una clave secreta y códigos de respaldo almacenados como hash que se usan únicamente para verificar tus inicios de sesión.</p>
          <p><Strong>Datos del dispositivo y de uso:</Strong> registros técnicos estándar (dirección IP, tipo de navegador) que nuestro proveedor de alojamiento recopila automáticamente por seguridad y fiabilidad. Consulta «Publicidad y cookies» más abajo para saber qué recopilan por separado nuestros socios publicitarios.</p>
        </Section>

        <Section title="Cómo usamos esta información">
          <p>
            Usamos tu información para operar la app: crear y administrar tus clubes, llevar el
            registro de aportes y turnos de entrega, enviarte correos transaccionales
            (restablecimiento de contraseña, notificaciones sobre tus clubes) y proteger tu
            cuenta. No vendemos tu información personal. El sitio web y la app sí muestran
            publicidad proporcionada por Google; consulta «Publicidad y cookies» más abajo para
            saber qué implica.
          </p>
        </Section>

        <Section title="Quién puede ver tu información">
          <p>
            Los demás miembros de un club al que te unes pueden ver lo que permita la
            configuración de ese club: por defecto tu nombre, tu turno y tu fecha de entrega,
            aunque el líder del club puede restringirlo. El líder de un club siempre puede ver el
            historial completo de pagos y la lista de miembros de los clubes que administra. Nunca
            compartimos tu información con nadie fuera de tus propios clubes.
          </p>
        </Section>

        <Section title="Servicios de terceros">
          <p>
            Usamos un número reducido de proveedores para operar la app: un servicio de base de
            datos para almacenar tu información, un servicio de correo para entregar los correos
            transaccionales y una plataforma de alojamiento para servir el sitio web y la app.
            Estos proveedores procesan los datos únicamente en nuestro nombre y no los usan para
            sus propios fines.
          </p>
        </Section>

        <Section title="Publicidad y cookies">
          <p>
            SanSavingClub se financia en parte con publicidad. Nuestro sitio web usa Google
            AdSense y nuestra app móvil usa Google AdMob para mostrar anuncios. Para ello, Google
            y sus socios publicitarios pueden usar cookies (en el sitio web) o el identificador
            de publicidad de tu dispositivo (en la app), junto con tu dirección IP e información
            general del dispositivo, para mostrar anuncios y medir su rendimiento y, cuando has
            dado tu consentimiento, para personalizar los anuncios que ves.
          </p>
          <p>
            Para este fin Google actúa de forma independiente, no simplemente en nuestro nombre, y
            usa estos datos conforme a su propia política de privacidad. Puedes leer cómo usa
            Google los datos de los sitios y las apps que utilizan sus servicios en{" "}
            <ExternalLink href="https://policies.google.com/technologies/partner-sites" />, y la Política de
            privacidad de Google en <ExternalLink href="https://policies.google.com/privacy" />.
          </p>
          <p>
            Si estás en el Espacio Económico Europeo, el Reino Unido o Suiza, un aviso de
            consentimiento te permite elegir si aceptas anuncios personalizados la primera vez
            que visitas el sitio web; puedes cambiar esa elección en cualquier momento desde el
            enlace de configuración del aviso. En la app móvil puedes revisar o cambiar tu
            elección de consentimiento publicitario desde{" "}
            <Strong>Perfil → Opciones de privacidad de anuncios</Strong>.
          </p>
        </Section>

        <Section title="Tus opciones">
          <p>
            Puedes actualizar o eliminar la información de tu cuenta, o pedirnos que eliminemos
            todos tus datos, escribiéndonos a <Email />. Al eliminar tu cuenta se borra tu
            información personal; los registros históricos del club de los que dependen otros
            miembros pueden conservarse de forma anonimizada.
          </p>
        </Section>

        <Section title="Privacidad de menores">
          <p>SanSavingClub no está dirigido a menores de 13 años y no recopilamos a sabiendas información de ellos.</p>
        </Section>

        <Section title="Cambios en esta política">
          <p>Si hacemos cambios importantes en esta política, actualizaremos la fecha indicada arriba y, cuando corresponda, te avisaremos en la app.</p>
        </Section>

        <Section title="Contacto">
          <p>
            ¿Tienes preguntas sobre esta política? Escribe a <Email />.
          </p>
        </Section>
      </div>
    </>
  );
}
