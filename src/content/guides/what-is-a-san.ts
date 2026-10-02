import type { Guide } from "../types";

export const whatIsASan: Guide = {
  slug: "what-is-a-san",
  updated: "2026-10-02",
  en: {
    title: "What is a san? How rotating savings clubs work",
    description:
      "A san — also called a tanda or savings club — is a group of people who each put in the same amount on a schedule and take turns receiving the whole pot. Here is how it works, with a full example.",
    blocks: [
      "A san is one of the oldest ways to save money in a group. A handful of people who trust each other agree to put in a fixed amount on a regular schedule, and every time they do, one of them takes home the full amount collected. The group keeps going until every member has had a turn.",
      "There is no bank in the middle, no interest and no paperwork beyond what the group decides to keep. That simplicity is why the same idea exists all over the world under different names — and it is also why the group has to be organized well for it to work.",

      { h: "The basic idea" },
      "Before starting, the group agrees on three things:",
      {
        ul: [
          "The quota: how much each member puts in every cycle.",
          "The schedule: how often the group pays — every week, every two weeks or every month.",
          "The turns: the order in which members receive the pot.",
        ],
      },
      "Every cycle, all members pay their quota and the member whose turn it is receives everything that was collected. A club with ten members has ten turns, so it lasts ten cycles. When the last member receives the pot, the club is finished. Many groups then start a new round.",

      { h: "A complete example" },
      "Ten people start a club with a quota of $100 a month. Every month the group collects 10 × $100 = $1,000, and one member receives it.",
      {
        table: {
          head: ["Month", "Each member pays", "Pot collected", "Who receives it"],
          rows: [
            ["1", "$100", "$1,000", "Member with turn 1"],
            ["2", "$100", "$1,000", "Member with turn 2"],
            ["3", "$100", "$1,000", "Member with turn 3"],
            ["…", "$100", "$1,000", "…"],
            ["10", "$100", "$1,000", "Member with turn 10"],
          ],
        },
      },
      "By the end, every member has paid $100 × 10 months = $1,000 and has received $1,000 exactly once. Nobody earns anything and nobody loses anything. What changes from member to member is when the money arrives: the first turns receive it early and keep paying afterwards, the last turns save for the whole club and receive at the end.",

      { h: "Why people use it" },
      {
        ul: [
          "It forces the habit of saving. Skipping a month means letting down people you know, which is a stronger reason to pay than a reminder from an app.",
          "It gives access to a lump sum. A member with an early turn gets the full pot long before they could have saved it alone, without asking a lender for it.",
          "It needs nothing but the group. No account to open, no credit history, no minimum balance.",
          "It is easy to understand. Everyone puts in the same and gets back the same.",
        ],
      },

      { h: "What a san is not" },
      {
        ul: [
          "It is not a bank account. The money is not held by a bank and is not protected by deposit insurance.",
          "It is not an investment. Nobody receives more than they put in, and anything that promises you will is something else.",
          "It is not a loan from a company. It is a private agreement between the members, and it is only as solid as their commitment to keep paying.",
        ],
      },
      "That last point is the heart of it. The club works because every member commits to paying the quota until the club ends, including after they have already received their turn.",

      { h: "One idea, many names" },
      "Economists call this a rotating savings and credit association, or ROSCA. In everyday life it has local names, among others:",
      {
        ul: [
          "San — Dominican Republic and Venezuela.",
          "Tanda or cundina — Mexico.",
          "Junta or pandero — Peru.",
          "Cadena — Colombia.",
          "Polla — Chile.",
          "Cuchubal — Guatemala and El Salvador.",
          "Sociedad — Puerto Rico.",
          "Susu or sou-sou — West Africa and the Caribbean.",
          "Partner — Jamaica.",
        ],
      },
      "The details vary from group to group, but the mechanics are the ones described above.",

      { h: "Who does what" },
      "Most clubs have one organizer — the person who brings the group together, keeps track of who has paid, and makes sure each turn is paid out on time. The other members have a simpler job: pay the quota on the agreed date and keep proof that they did.",
      "Traditionally all of this is tracked by hand in a notebook, a spreadsheet or a group chat, and that is where most problems start: a payment nobody wrote down, a date that two people remember differently, a receipt lost in a long conversation.",

      { h: "Where SanSavingClub fits" },
      "SanSavingClub replaces the notebook. The organizer creates the club with its quota and schedule, members join with an invite code, and each payment is reported with its amount, date, method and an optional receipt. The organizer approves it, and everyone can see the calendar of due dates and turns.",
      {
        note: "SanSavingClub only keeps the record. It does not hold or move the money — members pay each other directly, by whatever method the group agrees on.",
      },
    ],
  },
  es: {
    title: "¿Qué es un san? Cómo funcionan los clubes de ahorro rotativo",
    description:
      "Un san —también llamado tanda o club de ahorro— es un grupo de personas que aportan la misma cantidad cada cierto tiempo y se turnan para recibir el total reunido. Así funciona, con un ejemplo completo.",
    blocks: [
      "El san es una de las formas más antiguas de ahorrar en grupo. Varias personas que se tienen confianza acuerdan aportar una cantidad fija cada cierto tiempo y, cada vez que lo hacen, una de ellas se lleva todo lo reunido. El grupo sigue hasta que cada miembro ha tenido su turno.",
      "No hay un banco en el medio, ni intereses, ni más papeleo que el que el grupo decida llevar. Esa sencillez explica que la misma idea exista en todo el mundo con distintos nombres, y también que el grupo tenga que estar bien organizado para que funcione.",

      { h: "La idea básica" },
      "Antes de empezar, el grupo acuerda tres cosas:",
      {
        ul: [
          "La cuota: cuánto aporta cada miembro en cada ciclo.",
          "El calendario: cada cuánto se paga, ya sea cada semana, cada dos semanas o cada mes.",
          "Los turnos: el orden en que los miembros reciben el fondo.",
        ],
      },
      "En cada ciclo todos los miembros pagan su cuota y la persona a la que le toca el turno recibe todo lo reunido. Un club de diez miembros tiene diez turnos y por tanto dura diez ciclos. Cuando el último miembro recibe el fondo, el club termina. Muchos grupos empiezan entonces una nueva ronda.",

      { h: "Un ejemplo completo" },
      "Diez personas empiezan un club con una cuota de $100 al mes. Cada mes el grupo reúne 10 × $100 = $1,000 y un miembro los recibe.",
      {
        table: {
          head: ["Mes", "Cada miembro paga", "Fondo reunido", "Quién lo recibe"],
          rows: [
            ["1", "$100", "$1,000", "Miembro con el turno 1"],
            ["2", "$100", "$1,000", "Miembro con el turno 2"],
            ["3", "$100", "$1,000", "Miembro con el turno 3"],
            ["…", "$100", "$1,000", "…"],
            ["10", "$100", "$1,000", "Miembro con el turno 10"],
          ],
        },
      },
      "Al final, cada miembro ha pagado $100 × 10 meses = $1,000 y ha recibido $1,000 exactamente una vez. Nadie gana nada y nadie pierde nada. Lo que cambia de un miembro a otro es cuándo llega el dinero: los primeros turnos lo reciben pronto y siguen pagando después; los últimos ahorran durante todo el club y reciben al final.",

      { h: "Por qué la gente lo usa" },
      {
        ul: [
          "Obliga a crear el hábito de ahorrar. Saltarse un mes significa fallarle a personas que conoces, y eso pesa más que el recordatorio de una aplicación.",
          "Da acceso a una suma grande. Quien tiene un turno temprano recibe el fondo completo mucho antes de lo que habría podido ahorrarlo solo, sin pedírselo a un prestamista.",
          "Solo necesita al grupo. No hay que abrir una cuenta, ni tener historial de crédito, ni mantener un saldo mínimo.",
          "Es fácil de entender. Todos aportan lo mismo y reciben lo mismo.",
        ],
      },

      { h: "Lo que un san no es" },
      {
        ul: [
          "No es una cuenta bancaria. El dinero no está en un banco ni está protegido por un seguro de depósitos.",
          "No es una inversión. Nadie recibe más de lo que aportó, y cualquier cosa que te prometa lo contrario es otra cosa.",
          "No es un préstamo de una empresa. Es un acuerdo privado entre los miembros, y es tan sólido como su compromiso de seguir pagando.",
        ],
      },
      "Ese último punto es el centro de todo. El club funciona porque cada miembro se compromete a pagar su cuota hasta que el club termine, también después de haber recibido su turno.",

      { h: "Una idea, muchos nombres" },
      "Los economistas lo llaman asociación rotativa de ahorro y crédito (ROSCA, por sus siglas en inglés). En la vida diaria tiene nombres locales, entre otros:",
      {
        ul: [
          "San: República Dominicana y Venezuela.",
          "Tanda o cundina: México.",
          "Junta o pandero: Perú.",
          "Cadena: Colombia.",
          "Polla: Chile.",
          "Cuchubal: Guatemala y El Salvador.",
          "Sociedad: Puerto Rico.",
          "Susu o sou-sou: África Occidental y el Caribe.",
          "Partner: Jamaica.",
        ],
      },
      "Los detalles cambian de un grupo a otro, pero la mecánica es la que se describe arriba.",

      { h: "Quién hace qué" },
      "La mayoría de los clubes tiene un organizador: la persona que reúne al grupo, lleva la cuenta de quién ha pagado y se asegura de que cada turno se entregue a tiempo. Los demás miembros tienen una tarea más sencilla: pagar la cuota en la fecha acordada y guardar el comprobante.",
      "Tradicionalmente todo esto se lleva a mano en una libreta, una hoja de cálculo o un chat de grupo, y ahí empieza la mayoría de los problemas: un pago que nadie anotó, una fecha que dos personas recuerdan distinto, un recibo perdido en una conversación larga.",

      { h: "Dónde encaja SanSavingClub" },
      "SanSavingClub reemplaza la libreta. El organizador crea el club con su cuota y su calendario, los miembros se unen con un código de invitación y cada pago se reporta con su monto, fecha, método y un comprobante opcional. El organizador lo aprueba, y todos pueden ver el calendario de fechas de pago y de turnos.",
      {
        note: "SanSavingClub solo lleva el registro. No guarda ni mueve el dinero: los miembros se pagan directamente entre ellos, por el método que el grupo acuerde.",
      },
    ],
  },
};
