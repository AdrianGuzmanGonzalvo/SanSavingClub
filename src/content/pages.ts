import { CONTACT_EMAIL, OPERATOR_NAME } from "./site";
import type { ArticleContent, Localized } from "./types";

export const about: Localized<ArticleContent> = {
  en: {
    title: "About SanSavingClub",
    description: "Why SanSavingClub exists, what it does, and who runs it.",
    blocks: [
      { h: "Why it exists" },
      "SanSavingClub was created to help the people who organize a san or savings club with the record-keeping and management of their clubs. Until now there was no tool made for this kind of organization, and everything had to be done by hand.",
      "Anyone who has run a club knows what that means: a notebook or a spreadsheet, a group chat full of receipts, and the organizer answering the same question again and again — who has paid, and whose turn is it?",

      { h: "What it does" },
      {
        ul: [
          "The organizer creates a club with its quota and its schedule, and members join with an invite code.",
          "Turns can be assigned one by one or drawn at random.",
          "Members report each payment with its amount, date, method and an optional receipt, and the organizer approves it.",
          "A shared calendar shows every due date and every turn.",
          "Clubs can set a grace period and a late fee, and the organizer can post announcements.",
          "A club that is already running can be added and continued from its current cycle.",
          "The whole app is available in English and Spanish.",
        ],
      },

      { h: "What it does not do" },
      "SanSavingClub is a record-keeping tool. It does not hold or move money: members pay each other directly, by the method their club agrees on. It is not a bank, a lender or a financial adviser, and it cannot guarantee that the members of a club will pay.",

      { h: "Who runs it" },
      `SanSavingClub is operated by ${OPERATOR_NAME}, from Florida, United States.`,

      { h: "Get in touch" },
      `Questions, problems and suggestions are welcome at ${CONTACT_EMAIL}.`,
    ],
  },
  es: {
    title: "Acerca de SanSavingClub",
    description: "Por qué existe SanSavingClub, qué hace y quién lo opera.",
    blocks: [
      { h: "Por qué existe" },
      "SanSavingClub fue creado para ayudar a las personas que organizan un san o club de ahorro con el registro y el manejo de sus clubes. Antes no existía una herramienta para este tipo de organización y había que hacerlo todo a mano.",
      "Quien ha llevado un club sabe lo que eso significa: una libreta o una hoja de cálculo, un chat de grupo lleno de comprobantes y el organizador respondiendo una y otra vez la misma pregunta: ¿quién ha pagado y a quién le toca el turno?",

      { h: "Qué hace" },
      {
        ul: [
          "El organizador crea un club con su cuota y su calendario, y los miembros se unen con un código de invitación.",
          "Los turnos se pueden asignar uno por uno o por sorteo.",
          "Los miembros reportan cada pago con su monto, fecha, método y un comprobante opcional, y el organizador lo aprueba.",
          "Un calendario compartido muestra cada fecha de pago y cada turno.",
          "Los clubes pueden fijar un período de gracia y una multa por mora, y el organizador puede publicar anuncios.",
          "Un club que ya está en marcha se puede agregar y continuar desde el ciclo en el que va.",
          "Toda la app está disponible en español y en inglés.",
        ],
      },

      { h: "Qué no hace" },
      "SanSavingClub es una herramienta de registro. No guarda ni mueve dinero: los miembros se pagan directamente entre ellos, por el método que su club acuerde. No es un banco, ni un prestamista, ni un asesor financiero, y no puede garantizar que los miembros de un club paguen.",

      { h: "Quién lo opera" },
      `SanSavingClub es operado por ${OPERATOR_NAME}, desde Florida, Estados Unidos.`,

      { h: "Escríbenos" },
      `Las preguntas, los problemas y las sugerencias son bienvenidos en ${CONTACT_EMAIL}.`,
    ],
  },
};

export const contact: Localized<{
  title: string;
  description: string;
  emailLabel: string;
  topicsTitle: string;
  topics: string[];
  note: string;
}> = {
  en: {
    title: "Contact",
    description: "The quickest way to reach SanSavingClub is by email.",
    emailLabel: "Email",
    topicsTitle: "You can write to us about",
    topics: [
      "Questions about how the app works.",
      "A problem with your account or with a club.",
      "Requests about your personal data, including deleting your account.",
      "Corrections or suggestions for the guides on this site.",
    ],
    note: "If you already have an account, you can also send a message from the Support section inside the app. We reply by email.",
  },
  es: {
    title: "Contacto",
    description: "La forma más rápida de comunicarte con SanSavingClub es por correo electrónico.",
    emailLabel: "Correo",
    topicsTitle: "Puedes escribirnos sobre",
    topics: [
      "Preguntas sobre cómo funciona la app.",
      "Un problema con tu cuenta o con un club.",
      "Solicitudes sobre tus datos personales, incluida la eliminación de tu cuenta.",
      "Correcciones o sugerencias para las guías de este sitio.",
    ],
    note: "Si ya tienes una cuenta, también puedes enviar un mensaje desde la sección de Soporte dentro de la app. Respondemos por correo.",
  },
};

export const TERMS_UPDATED = "2026-10-02";

export const terms: Localized<ArticleContent> = {
  en: {
    title: "Terms of Use",
    description: "The rules for using the SanSavingClub website and app.",
    blocks: [
      { h: "1. About these terms" },
      `These terms apply to the website sansavingclub.com and to the SanSavingClub mobile app (together, "the service"). The service is operated by ${OPERATOR_NAME}, from Florida, United States. By creating an account or using the service, you agree to these terms. If you do not agree, please do not use the service.`,

      { h: "2. Who can use the service" },
      "You must be at least 18 years old to create an account or use the service.",

      { h: "3. What the service is" },
      "SanSavingClub is a tool for organizing private group savings clubs and keeping their records: the members of a club, its quota and schedule, the order of turns, the payments that members report, and the organizer's approval of them.",

      { h: "4. What the service is not" },
      {
        ul: [
          "The service does not process payments and does not hold, receive or transfer money. Members pay each other directly, outside the service.",
          "SanSavingClub is not a bank, a lender, a payment processor or a financial adviser.",
          "Each club is a private agreement among its members. SanSavingClub is not a party to that agreement.",
          "SanSavingClub does not guarantee that any member will pay, that any turn will be paid out, or that a club will be completed.",
          "The guides on the website are general information. They are not legal, tax or financial advice.",
        ],
      },

      { h: "5. Your account" },
      "Give accurate information when you register and keep your password private. You are responsible for what is done through your account. Tell us if you believe someone else has used it.",

      { h: "6. Your responsibilities in a club" },
      {
        ul: [
          "Report your payments truthfully, with the real amount, date and method.",
          "If you organize a club, you are responsible for the accuracy of what you record and approve.",
          "Disagreements between members of a club are for those members to resolve. SanSavingClub does not arbitrate them.",
        ],
      },

      { h: "7. Acceptable use" },
      "You agree not to use the service to:",
      {
        ul: [
          "Break the law or help someone else do so.",
          "Deceive other people, or run a scheme that promises returns or depends on recruiting new participants.",
          "Pretend to be someone else.",
          "Upload content that is unlawful or that you have no right to share.",
          "Access other people's accounts or data, or interfere with the operation of the service.",
        ],
      },

      { h: "8. Content you add" },
      "The information and files you add — such as payment notes and receipt images — remain yours. You give us permission to store them and to show them to the members of your club as needed to operate the service.",

      { h: "9. Advertising" },
      "The website and the app show advertising provided by Google. The Privacy Policy explains what that involves.",

      { h: "10. Privacy" },
      "The Privacy Policy describes what information the service collects and how it is used. It is part of these terms.",

      { h: "11. Availability and changes" },
      "We work to keep the service available, but we do not guarantee that it will be uninterrupted or free of errors. Features may be changed, suspended or discontinued.",

      { h: "12. Closing or suspending an account" },
      `You can stop using the service at any time and ask us to delete your account by writing to ${CONTACT_EMAIL}. We may suspend or close accounts that break these terms.`,

      { h: "13. No warranties" },
      'The service is provided "as is" and "as available", without warranties of any kind, to the extent permitted by law.',

      { h: "14. Limitation of liability" },
      "To the extent permitted by law, SanSavingClub and its operator are not liable for losses that arise from a savings club or from the use of the service, including a member who does not pay, a dispute between members, or decisions made on the basis of the records or the guides.",

      { h: "15. Changes to these terms" },
      "We may update these terms. When we do, we will change the date at the top of this page. If you keep using the service after a change, you accept the updated terms.",

      { h: "16. Contact" },
      `Questions about these terms can be sent to ${CONTACT_EMAIL}.`,
    ],
  },
  es: {
    title: "Términos de uso",
    description: "Las reglas para usar el sitio web y la app de SanSavingClub.",
    blocks: [
      { h: "1. Sobre estos términos" },
      `Estos términos se aplican al sitio web sansavingclub.com y a la app móvil SanSavingClub (en conjunto, «el servicio»). El servicio es operado por ${OPERATOR_NAME}, desde Florida, Estados Unidos. Al crear una cuenta o usar el servicio, aceptas estos términos. Si no estás de acuerdo, por favor no uses el servicio.`,

      { h: "2. Quién puede usar el servicio" },
      "Debes tener al menos 18 años para crear una cuenta o usar el servicio.",

      { h: "3. Qué es el servicio" },
      "SanSavingClub es una herramienta para organizar clubes privados de ahorro grupal y llevar su registro: los miembros de un club, su cuota y su calendario, el orden de los turnos, los pagos que reportan los miembros y la aprobación de esos pagos por parte del organizador.",

      { h: "4. Qué no es el servicio" },
      {
        ul: [
          "El servicio no procesa pagos y no guarda, recibe ni transfiere dinero. Los miembros se pagan directamente entre ellos, fuera del servicio.",
          "SanSavingClub no es un banco, ni un prestamista, ni un procesador de pagos, ni un asesor financiero.",
          "Cada club es un acuerdo privado entre sus miembros. SanSavingClub no es parte de ese acuerdo.",
          "SanSavingClub no garantiza que ningún miembro pague, que se entregue ningún turno ni que un club se complete.",
          "Las guías del sitio web son información general. No constituyen asesoría legal, fiscal ni financiera.",
        ],
      },

      { h: "5. Tu cuenta" },
      "Da información verdadera al registrarte y mantén tu contraseña en privado. Eres responsable de lo que se haga desde tu cuenta. Avísanos si crees que otra persona la ha usado.",

      { h: "6. Tus responsabilidades en un club" },
      {
        ul: [
          "Reporta tus pagos con veracidad, con el monto, la fecha y el método reales.",
          "Si organizas un club, eres responsable de la exactitud de lo que registras y apruebas.",
          "Los desacuerdos entre los miembros de un club les corresponde resolverlos a esos miembros. SanSavingClub no actúa como árbitro.",
        ],
      },

      { h: "7. Uso aceptable" },
      "Te comprometes a no usar el servicio para:",
      {
        ul: [
          "Infringir la ley o ayudar a otra persona a hacerlo.",
          "Engañar a otras personas, ni operar un esquema que prometa ganancias o que dependa de reclutar nuevos participantes.",
          "Hacerte pasar por otra persona.",
          "Subir contenido ilegal o que no tienes derecho a compartir.",
          "Acceder a cuentas o datos de otras personas, ni interferir con el funcionamiento del servicio.",
        ],
      },

      { h: "8. El contenido que agregas" },
      "La información y los archivos que agregas —como notas de pago e imágenes de comprobantes— siguen siendo tuyos. Nos das permiso para almacenarlos y mostrarlos a los miembros de tu club en la medida necesaria para operar el servicio.",

      { h: "9. Publicidad" },
      "El sitio web y la app muestran publicidad proporcionada por Google. La Política de privacidad explica lo que eso implica.",

      { h: "10. Privacidad" },
      "La Política de privacidad describe qué información recopila el servicio y cómo se usa. Forma parte de estos términos.",

      { h: "11. Disponibilidad y cambios" },
      "Trabajamos para mantener el servicio disponible, pero no garantizamos que funcione sin interrupciones ni sin errores. Las funciones pueden cambiarse, suspenderse o dejar de ofrecerse.",

      { h: "12. Cierre o suspensión de una cuenta" },
      `Puedes dejar de usar el servicio en cualquier momento y pedirnos que eliminemos tu cuenta escribiendo a ${CONTACT_EMAIL}. Podemos suspender o cerrar las cuentas que incumplan estos términos.`,

      { h: "13. Sin garantías" },
      "El servicio se ofrece «tal cual» y «según disponibilidad», sin garantías de ningún tipo, en la medida en que la ley lo permita.",

      { h: "14. Limitación de responsabilidad" },
      "En la medida en que la ley lo permita, SanSavingClub y su operador no son responsables de las pérdidas que surjan de un club de ahorro o del uso del servicio, incluido un miembro que no paga, una disputa entre miembros o las decisiones tomadas a partir de los registros o de las guías.",

      { h: "15. Cambios en estos términos" },
      "Podemos actualizar estos términos. Cuando lo hagamos, cambiaremos la fecha que aparece al principio de esta página. Si sigues usando el servicio después de un cambio, aceptas los términos actualizados.",

      { h: "16. Contacto" },
      `Las preguntas sobre estos términos se pueden enviar a ${CONTACT_EMAIL}.`,
    ],
  },
};

export const guidesIndex: Localized<{ title: string; description: string; readGuide: string; moreGuides: string }> = {
  en: {
    title: "Guides to saving in a group",
    description:
      "Practical guides for people who organize or take part in a san, tanda or savings club: how it works, how to set one up, and how to handle the difficult moments.",
    readGuide: "Read the guide",
    moreGuides: "More guides",
  },
  es: {
    title: "Guías para ahorrar en grupo",
    description:
      "Guías prácticas para quienes organizan un san, tanda o club de ahorro, o participan en uno: cómo funciona, cómo armarlo y cómo manejar los momentos difíciles.",
    readGuide: "Leer la guía",
    moreGuides: "Más guías",
  },
};

export const home: Localized<{
  description: string;
  explainer: { title: string; paragraphs: string[]; link: string };
  steps: { title: string; items: { title: string; description: string }[]; link: string };
  guides: { title: string; subtitle: string; all: string };
  calculator: { title: string; description: string; link: string };
  agreement: { title: string; description: string; link: string };
  faq: { title: string; items: { question: string; answer: string }[] };
}> = {
  en: {
    description:
      "Form a private savings club with people you trust, contribute a fixed quota, and take turns receiving the pooled payout — with receipts, approvals, and a shared calendar.",
    explainer: {
      title: "What is a san?",
      paragraphs: [
        "A san — known in other countries as a tanda, cundina, junta or susu — is a savings club. A group of people who trust each other each put in the same amount on a regular schedule, and every time they do, one member receives everything that was collected. The club continues until each member has had a turn.",
        "Ten people paying $100 a month collect $1,000 every month, and over ten months each of them receives $1,000 once. Nobody earns interest and nobody pays any: it is a way of saving together, and of getting a lump sum earlier than you could have saved it alone.",
      ],
      link: "Read the full explanation",
    },
    steps: {
      title: "How SanSavingClub helps",
      items: [
        {
          title: "Set up the club",
          description: "The organizer enters the quota and the schedule, shares an invite code, and assigns or draws the turns.",
        },
        {
          title: "Report each payment",
          description: "Members pay each other directly, then report the payment with its date, method and receipt.",
        },
        {
          title: "Everyone sees the same record",
          description: "The organizer approves payments and marks each turn as paid. The calendar shows what is due and who is next.",
        },
      ],
      link: "See the full walkthrough",
    },
    guides: {
      title: "Guides",
      subtitle: "Practical guides to running a savings club well.",
      all: "All guides",
    },
    calculator: {
      title: "Plan a club before you start",
      description:
        "Enter the number of members and the quota to see the pot per turn, how long the club lasts and the date of every turn.",
      link: "Open the calculator",
    },
    agreement: {
      title: "Put the rules in writing",
      description:
        "Fill in your club's quota, dates and late-payment rule and get a short written agreement to share with the group before the first payment.",
      link: "Create the agreement",
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        {
          question: "Does SanSavingClub hold or move my money?",
          answer:
            "No. Members pay each other directly, by the method their club agrees on. SanSavingClub keeps the record: who paid, when, how much and with what proof.",
        },
        {
          question: "Which payment methods can a club use?",
          answer:
            "Any method the group agrees on. When members report a payment they mark it as Zelle, Cash App, bank transfer, cash or other, and can attach a receipt.",
        },
        {
          question: "Who can see my payments?",
          answer:
            "The organizer of a club can see its full payment history and member list. Other members see what the club's settings allow — by default your name, your turn and your payout date.",
        },
        {
          question: "Can I add a club that has already started?",
          answer: "Yes. You can add it as an ongoing club and continue from the cycle it is currently on.",
        },
        {
          question: "What happens if someone does not pay?",
          answer:
            "SanSavingClub cannot make anyone pay, but it shows clearly who is behind. Each club sets its own grace period and late fee. Our guide on late and missed payments explains how an organizer can handle each case.",
        },
        {
          question: "Is it available in Spanish?",
          answer: "Yes. The website and the app are available in English and Spanish.",
        },
      ],
    },
  },
  es: {
    description:
      "Forma un club de ahorro privado con personas de confianza, aporta una cuota fija y túrnense para recibir el fondo reunido, con comprobantes, aprobaciones y un calendario compartido.",
    explainer: {
      title: "¿Qué es un san?",
      paragraphs: [
        "Un san —conocido en otros países como tanda, cundina, junta o susu— es un club de ahorro. Un grupo de personas que se tienen confianza aporta la misma cantidad cada cierto tiempo y, cada vez que lo hacen, un miembro recibe todo lo reunido. El club sigue hasta que cada miembro ha tenido su turno.",
        "Diez personas que pagan $100 al mes reúnen $1,000 cada mes, y a lo largo de diez meses cada una recibe $1,000 una vez. Nadie gana intereses y nadie los paga: es una forma de ahorrar juntos y de tener una suma grande antes de lo que podrías haberla ahorrado solo.",
      ],
      link: "Leer la explicación completa",
    },
    steps: {
      title: "Cómo ayuda SanSavingClub",
      items: [
        {
          title: "Arma el club",
          description: "El organizador ingresa la cuota y el calendario, comparte un código de invitación y asigna o sortea los turnos.",
        },
        {
          title: "Reporta cada pago",
          description: "Los miembros se pagan directamente entre ellos y luego reportan el pago con su fecha, método y comprobante.",
        },
        {
          title: "Todos ven el mismo registro",
          description: "El organizador aprueba los pagos y marca cada turno como entregado. El calendario muestra qué vence y a quién le toca.",
        },
      ],
      link: "Ver el recorrido completo",
    },
    guides: {
      title: "Guías",
      subtitle: "Guías prácticas para llevar bien un club de ahorro.",
      all: "Todas las guías",
    },
    calculator: {
      title: "Planifica un club antes de empezar",
      description:
        "Ingresa el número de miembros y la cuota para ver el fondo por turno, cuánto dura el club y la fecha de cada turno.",
      link: "Abrir la calculadora",
    },
    agreement: {
      title: "Pon las reglas por escrito",
      description:
        "Completa la cuota, las fechas y la regla de pagos atrasados de tu club y obtén un acuerdo corto por escrito para compartir con el grupo antes del primer pago.",
      link: "Crear el acuerdo",
    },
    faq: {
      title: "Preguntas frecuentes",
      items: [
        {
          question: "¿SanSavingClub guarda o mueve mi dinero?",
          answer:
            "No. Los miembros se pagan directamente entre ellos, por el método que su club acuerde. SanSavingClub lleva el registro: quién pagó, cuándo, cuánto y con qué comprobante.",
        },
        {
          question: "¿Qué métodos de pago puede usar un club?",
          answer:
            "Cualquier método que el grupo acuerde. Al reportar un pago, los miembros lo marcan como Zelle, Cash App, transferencia bancaria, efectivo u otro, y pueden adjuntar un comprobante.",
        },
        {
          question: "¿Quién puede ver mis pagos?",
          answer:
            "El organizador de un club puede ver su historial completo de pagos y la lista de miembros. Los demás miembros ven lo que permita la configuración del club: por defecto tu nombre, tu turno y tu fecha de entrega.",
        },
        {
          question: "¿Puedo agregar un club que ya empezó?",
          answer: "Sí. Puedes agregarlo como club en curso y continuar desde el ciclo en el que va.",
        },
        {
          question: "¿Qué pasa si alguien no paga?",
          answer:
            "SanSavingClub no puede obligar a nadie a pagar, pero muestra con claridad quién está atrasado. Cada club fija su propio período de gracia y su multa por mora. Nuestra guía sobre pagos atrasados explica cómo puede manejar el organizador cada caso.",
        },
        {
          question: "¿Está disponible en inglés?",
          answer: "Sí. El sitio web y la app están disponibles en español y en inglés.",
        },
      ],
    },
  },
};

export const calculator: Localized<{
  title: string;
  description: string;
  members: string;
  quota: string;
  frequency: string;
  frequencies: { weekly: string; biweekly: string; monthly: string };
  startDate: string;
  startDateHint: string;
  yourTurn: string;
  results: string;
  potPerTurn: string;
  length: string;
  lengthUnits: { weekly: string; biweekly: string; monthly: string };
  totalPerMember: string;
  yourTurnTitle: string;
  paidBefore: string;
  receive: string;
  stillToPay: string;
  schedule: string;
  turn: string;
  date: string;
  cycle: string;
  pot: string;
  you: string;
  explainerTitle: string;
  explainer: string[];
  cta: string;
}> = {
  en: {
    title: "Savings club calculator",
    description:
      "Plan a san or tanda before you start it: see the pot per turn, how long the club lasts, and the date of every turn.",
    members: "Number of members",
    quota: "Quota per member",
    frequency: "How often the group pays",
    frequencies: { weekly: "Every week", biweekly: "Every two weeks", monthly: "Every month" },
    startDate: "Date of the first payout",
    startDateHint: "Optional. Add it to see the date of every turn.",
    yourTurn: "Your turn",
    results: "Your club",
    potPerTurn: "Pot per turn",
    length: "Length of the club",
    lengthUnits: { weekly: "{n} weeks", biweekly: "{n} weeks", monthly: "{n} months" },
    totalPerMember: "Each member pays in total",
    yourTurnTitle: "With turn {n}",
    paidBefore: "Paid in by the time you receive",
    receive: "You receive",
    stillToPay: "Still to pay afterwards",
    schedule: "Schedule of turns",
    turn: "Turn",
    date: "Payout date",
    cycle: "Cycle {n}",
    pot: "Pot",
    you: "you",
    explainerTitle: "How the numbers work",
    explainer: [
      "A club has as many turns as it has members, so the number of members also decides how long it lasts.",
      "The pot paid out in each turn is the quota multiplied by the number of members.",
      "Over the whole club, every member pays in exactly the amount they receive. What changes is when: an early turn receives the pot first and keeps paying afterwards, a late turn saves first and receives at the end.",
    ],
    cta: "Create this club",
  },
  es: {
    title: "Calculadora de club de ahorro",
    description:
      "Planifica un san o una tanda antes de empezar: mira el fondo por turno, cuánto dura el club y la fecha de cada turno.",
    members: "Número de miembros",
    quota: "Cuota por miembro",
    frequency: "Cada cuánto paga el grupo",
    frequencies: { weekly: "Cada semana", biweekly: "Cada dos semanas", monthly: "Cada mes" },
    startDate: "Fecha de la primera entrega",
    startDateHint: "Opcional. Agrégala para ver la fecha de cada turno.",
    yourTurn: "Tu turno",
    results: "Tu club",
    potPerTurn: "Fondo por turno",
    length: "Duración del club",
    lengthUnits: { weekly: "{n} semanas", biweekly: "{n} semanas", monthly: "{n} meses" },
    totalPerMember: "Cada miembro paga en total",
    yourTurnTitle: "Con el turno {n}",
    paidBefore: "Aportado cuando recibes",
    receive: "Recibes",
    stillToPay: "Te queda por pagar",
    schedule: "Calendario de turnos",
    turn: "Turno",
    date: "Fecha de entrega",
    cycle: "Ciclo {n}",
    pot: "Fondo",
    you: "tú",
    explainerTitle: "Cómo funcionan los números",
    explainer: [
      "Un club tiene tantos turnos como miembros, así que el número de miembros también decide cuánto dura.",
      "El fondo que se entrega en cada turno es la cuota multiplicada por el número de miembros.",
      "A lo largo de todo el club, cada miembro aporta exactamente lo mismo que recibe. Lo que cambia es cuándo: un turno temprano recibe el fondo primero y sigue pagando después; un turno tardío ahorra primero y recibe al final.",
    ],
    cta: "Crear este club",
  },
};

export type CalculatorLabels = (typeof calculator)["en"];

export const agreement: Localized<{
  title: string;
  description: string;
  intro: string[];
  fields: {
    club: string;
    members: string;
    quota: string;
    frequency: string;
    dueDay: string;
    payoutDay: string;
    graceDays: string;
    lateFee: string;
    organizer: string;
    methods: string;
    refund: string;
  };
  defaults: { club: string; dueDay: string; payoutDay: string; organizer: string; methods: string };
  frequencies: { weekly: string; biweekly: string; monthly: string };
  refunds: { now: string; end: string };
  heading: string;
  clauses: {
    numbers: string;
    dates: string;
    commitment: string;
    lateWithFee: string;
    lateWithGrace: string;
    lateSimple: string;
    payments: string;
    turns: string;
    leaving: string;
    stopping: string;
    record: string;
    other: string;
  };
  signature: string;
  copy: string;
  copied: string;
  print: string;
  note: string;
  guideLink: string;
}> = {
  en: {
    title: "Savings club agreement template",
    description:
      "Fill in your club's numbers and get a written agreement for your san or tanda that you can copy and share with the group before the first payment.",
    intro: [
      "Most problems in a savings club come from something that was never written down. This tool turns your club's numbers and rules into a short agreement the whole group can read and accept before starting.",
      "Change any field and the text below updates. Nothing you type here is saved or sent anywhere.",
    ],
    fields: {
      club: "Name of the club",
      members: "Number of members",
      quota: "Quota per member",
      frequency: "How often the group pays",
      dueDay: "When the quota is due",
      payoutDay: "When the pot is paid out",
      graceDays: "Grace period (days)",
      lateFee: "Late fee",
      organizer: "Organizer",
      methods: "Payment methods",
      refund: "If a member leaves before receiving, what they paid is returned",
    },
    defaults: {
      club: "Our club",
      dueDay: "on the 1st of each month",
      payoutDay: "on the 5th of each month",
      organizer: "the organizer",
      methods: "Zelle, bank transfer or cash",
    },
    frequencies: { weekly: "every week", biweekly: "every two weeks", monthly: "every month" },
    refunds: { now: "right away", end: "when the club ends" },
    heading: "Agreement of {club}",
    clauses: {
      numbers:
        "{club} is a savings club with {members} members. Each member pays {quota} {frequency}, for {members} cycles. The pot paid out in each cycle is {pot}.",
      dates: "The quota is due {dueDay}. The pot is paid out {payoutDay} to the member whose turn it is.",
      commitment:
        "Each member commits to paying every quota until the last turn has been paid, including after receiving their own turn.",
      lateWithFee: "A payment made more than {grace} days after the due date is late and carries a fee of {fee}.",
      lateWithGrace: "A payment made more than {grace} days after the due date is considered late.",
      lateSimple: "A payment made after the due date is considered late.",
      payments: "Payments are sent to {organizer} by {methods}. Every payment is reported with proof.",
      turns:
        "The order of turns is agreed before the first payment and shared with all members. Two members may swap turns if both agree and tell the organizer beforehand.",
      leaving:
        "A member who needs to leave before receiving their turn tells the organizer as soon as possible. What they paid in is returned {refund}, and the group decides who takes the turn.",
      stopping: "A member who has received their turn and stops paying still owes the group the remaining quotas.",
      record: "{Organizer} keeps a record of all payments that any member can consult.",
      other: "Anything not covered here is decided by a majority of the members.",
    },
    signature: "Accepted by the members on: ____________",
    copy: "Copy the agreement",
    copied: "Copied",
    print: "Print",
    note: "This template is a practical starting point, not legal advice. If your club handles amounts that are significant for its members, consider having the agreement reviewed by someone qualified where you live.",
    guideLink: "Read the guide to club rules",
  },
  es: {
    title: "Modelo de acuerdo para un club de ahorro",
    description:
      "Completa los números de tu club y obtén un acuerdo por escrito para tu san o tanda, que puedes copiar y compartir con el grupo antes del primer pago.",
    intro: [
      "La mayoría de los problemas de un club de ahorro vienen de algo que nunca se puso por escrito. Esta herramienta convierte los números y las reglas de tu club en un acuerdo corto que todo el grupo puede leer y aceptar antes de empezar.",
      "Cambia cualquier campo y el texto de abajo se actualiza. Nada de lo que escribes aquí se guarda ni se envía a ningún lugar.",
    ],
    fields: {
      club: "Nombre del club",
      members: "Número de miembros",
      quota: "Cuota por miembro",
      frequency: "Cada cuánto paga el grupo",
      dueDay: "Cuándo vence la cuota",
      payoutDay: "Cuándo se entrega el fondo",
      graceDays: "Período de gracia (días)",
      lateFee: "Multa por mora",
      organizer: "Organizador",
      methods: "Métodos de pago",
      refund: "Si un miembro sale antes de recibir, lo que aportó se le devuelve",
    },
    defaults: {
      club: "Nuestro club",
      dueDay: "el día 1 de cada mes",
      payoutDay: "el día 5 de cada mes",
      organizer: "el organizador",
      methods: "Zelle, transferencia bancaria o efectivo",
    },
    frequencies: { weekly: "cada semana", biweekly: "cada dos semanas", monthly: "cada mes" },
    refunds: { now: "de inmediato", end: "cuando termine el club" },
    heading: "Acuerdo de {club}",
    clauses: {
      numbers:
        "{club} es un club de ahorro de {members} miembros. Cada miembro paga {quota} {frequency}, durante {members} ciclos. El fondo que se entrega en cada ciclo es de {pot}.",
      dates: "La cuota vence {dueDay}. El fondo se entrega {payoutDay} al miembro al que le toca el turno.",
      commitment:
        "Cada miembro se compromete a pagar todas las cuotas hasta que se haya entregado el último turno, también después de recibir el suyo.",
      lateWithFee:
        "Un pago hecho más de {grace} días después de la fecha límite se considera atrasado y lleva una multa de {fee}.",
      lateWithGrace: "Un pago hecho más de {grace} días después de la fecha límite se considera atrasado.",
      lateSimple: "Un pago hecho después de la fecha límite se considera atrasado.",
      payments: "Los pagos se envían a {organizer} por {methods}. Cada pago se reporta con su comprobante.",
      turns:
        "El orden de los turnos se acuerda antes del primer pago y se comparte con todos los miembros. Dos miembros pueden intercambiar sus turnos si ambos están de acuerdo y avisan antes al organizador.",
      leaving:
        "Un miembro que necesite salir antes de recibir su turno avisa al organizador lo antes posible. Lo que aportó se le devuelve {refund}, y el grupo decide quién toma el turno.",
      stopping: "Un miembro que ya recibió su turno y deja de pagar sigue debiéndole al grupo las cuotas restantes.",
      record: "{Organizer} lleva un registro de todos los pagos que cualquier miembro puede consultar.",
      other: "Lo que no esté previsto aquí se decide por mayoría de los miembros.",
    },
    signature: "Aceptado por los miembros el: ____________",
    copy: "Copiar el acuerdo",
    copied: "Copiado",
    print: "Imprimir",
    note: "Este modelo es un punto de partida práctico, no asesoría legal. Si tu club maneja montos importantes para sus miembros, considera que alguien calificado en el lugar donde vives revise el acuerdo.",
    guideLink: "Leer la guía de reglas del club",
  },
};

export type AgreementLabels = (typeof agreement)["en"];
