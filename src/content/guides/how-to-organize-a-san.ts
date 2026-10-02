import type { Guide } from "../types";

export const howToOrganizeASan: Guide = {
  slug: "how-to-organize-a-san",
  updated: "2026-10-02",
  en: {
    title: "How to organize a san, step by step",
    description:
      "From choosing the members to paying out the last turn: the decisions an organizer has to make before a savings club starts, and the routine that keeps it running.",
    blocks: [
      "Organizing a san is not complicated, but almost every problem a club runs into later comes from something that was left vague at the start. This guide goes through the decisions in the order you will face them.",

      { h: "1. Decide the size and the goal" },
      "Three numbers define a club, and they depend on each other: the quota, the number of members and how often the group pays.",
      {
        ul: [
          "Pot per turn = quota × number of members.",
          "Length of the club = number of members × time between payments.",
        ],
      },
      "A bigger group means a bigger pot, but also a longer club and more people who have to keep their word. These three clubs show the trade-off:",
      {
        table: {
          head: ["Members", "Quota", "Frequency", "Pot per turn", "Length"],
          rows: [
            ["6", "$200", "Monthly", "$1,200", "6 months"],
            ["10", "$100", "Monthly", "$1,000", "10 months"],
            ["12", "$50", "Weekly", "$600", "12 weeks"],
          ],
        },
      },
      "If this is the first club for the group, a short one is easier to finish well, and finishing well is what makes people want to join the next round.",

      { h: "2. Choose the members" },
      "A san runs on trust, so membership is the most important decision. Invite people you know, or people someone in the group can vouch for. Two questions matter for each person:",
      {
        ul: [
          "Can they afford this quota for the whole length of the club, not just this month?",
          "Will they keep paying after they have received their turn?",
        ],
      },
      "The second question is the one that decides whether a club ends well. Every member has to commit to paying the quota until the club finishes, exactly as agreed before starting.",

      { h: "3. Set the quota and the frequency" },
      "Pick a quota that the member with the tightest budget can pay comfortably. A club where one person is struggling from the second month is fragile for everyone.",
      "Match the frequency to how people get paid. If most members are paid every week or every two weeks, a weekly or biweekly quota is easier to keep up with than one large monthly payment.",

      { h: "4. Fix the dates" },
      "Every cycle has two dates: the day the quota is due and the day the pot is paid out. Leave a few days between them. That gap gives the organizer time to collect, chase a late payment and still pay the turn on the promised date.",

      { h: "5. Agree on the rules before the first payment" },
      "Write down what happens when someone pays late, what a member has to do if they need to leave, and whether turns can be swapped. It is much easier to agree on these while nobody is affected yet. Our guide to club rules has a list you can use as a starting point.",

      { h: "6. Assign the turns" },
      "Decide the order in which members receive the pot — by drawing lots, by need or by agreement — and announce it to everyone before the club starts. The order matters more than it seems, because an early turn and a late turn are very different positions; the guide on turn order explains why.",

      { h: "7. Decide how the money moves" },
      "There are two common ways: members send their quota to the organizer, who passes the pot to that cycle's recipient; or members pay the recipient directly. Either works, as long as everyone knows which one the club uses and which payment methods are accepted.",
      "Whichever you choose, ask for proof of every payment: a screenshot of the transfer or a signed receipt for cash.",

      { h: "8. Keep a record everyone can see" },
      "For each payment, record who paid, how much, on what date, by which method and where the proof is. A record that only the organizer can see invites doubt; one that every member can check prevents most arguments before they start.",

      { h: "9. Pay out each turn and close the cycle" },
      "When the quotas for a cycle are in, pay the pot to the member whose turn it is and mark that cycle as done. Repeat until the last turn. When it is paid, the club is complete, and the group can decide whether to start another round with the same members.",

      { h: "Checklist before you start" },
      {
        ul: [
          "Everyone knows the quota, the frequency and how many turns the club has.",
          "The due date and the payout date for each cycle are fixed.",
          "The rules for late payments and for leaving the club are written down.",
          "Every member knows their turn.",
          "The group has agreed on how payments are sent and what counts as proof.",
          "There is one place where all payments are recorded.",
        ],
      },

      { h: "Doing it with SanSavingClub" },
      {
        ol: [
          "Create the club with its name, quota and total amount. The app works out how many turns fit.",
          "Pick the first due date and payout date. The following cycles repeat from there.",
          "Share the invite code so members can join.",
          "Assign the turns, or draw them at random for the members who don't have one yet.",
          "Activate the club. From then on, members report each payment with its proof and you approve it.",
          "When you have paid a turn, mark the payout as done to close the cycle and open the next one.",
        ],
      },
      "If your club is already running, you can add it as an ongoing club and continue from the cycle it is on.",
    ],
  },
  es: {
    title: "Cómo organizar un san, paso a paso",
    description:
      "Desde elegir a los miembros hasta entregar el último turno: las decisiones que el organizador debe tomar antes de empezar un club de ahorro y la rutina que lo mantiene funcionando.",
    blocks: [
      "Organizar un san no es complicado, pero casi todos los problemas que aparecen después vienen de algo que quedó poco claro al principio. Esta guía recorre las decisiones en el orden en que las vas a enfrentar.",

      { h: "1. Decide el tamaño y la meta" },
      "Tres números definen un club y dependen entre sí: la cuota, el número de miembros y cada cuánto se paga.",
      {
        ul: [
          "Fondo por turno = cuota × número de miembros.",
          "Duración del club = número de miembros × tiempo entre pagos.",
        ],
      },
      "Un grupo más grande significa un fondo mayor, pero también un club más largo y más personas que tienen que cumplir su palabra. Estos tres clubes muestran la diferencia:",
      {
        table: {
          head: ["Miembros", "Cuota", "Frecuencia", "Fondo por turno", "Duración"],
          rows: [
            ["6", "$200", "Mensual", "$1,200", "6 meses"],
            ["10", "$100", "Mensual", "$1,000", "10 meses"],
            ["12", "$50", "Semanal", "$600", "12 semanas"],
          ],
        },
      },
      "Si es el primer club del grupo, uno corto es más fácil de terminar bien, y terminar bien es lo que hace que la gente quiera entrar en la siguiente ronda.",

      { h: "2. Elige a los miembros" },
      "Un san funciona por confianza, así que elegir a los miembros es la decisión más importante. Invita a personas que conoces o a personas por las que alguien del grupo pueda responder. Con cada una importan dos preguntas:",
      {
        ul: [
          "¿Puede pagar esta cuota durante todo el club, y no solo este mes?",
          "¿Seguirá pagando después de haber recibido su turno?",
        ],
      },
      "La segunda pregunta es la que decide si un club termina bien. Cada miembro tiene que comprometerse a pagar la cuota hasta que el club termine, tal como se acordó antes de empezar.",

      { h: "3. Fija la cuota y la frecuencia" },
      "Elige una cuota que el miembro con el presupuesto más ajustado pueda pagar con comodidad. Un club en el que una persona ya tiene dificultades al segundo mes es frágil para todos.",
      "Ajusta la frecuencia a la forma en que cobra la gente. Si la mayoría cobra cada semana o cada dos semanas, una cuota semanal o quincenal es más fácil de cumplir que un solo pago grande al mes.",

      { h: "4. Fija las fechas" },
      "Cada ciclo tiene dos fechas: el día en que vence la cuota y el día en que se entrega el fondo. Deja unos días entre una y otra. Ese margen le da tiempo al organizador para cobrar, perseguir un pago atrasado y aun así entregar el turno en la fecha prometida.",

      { h: "5. Acuerden las reglas antes del primer pago" },
      "Dejen por escrito qué pasa cuando alguien paga tarde, qué debe hacer un miembro si necesita salir y si los turnos se pueden intercambiar. Es mucho más fácil ponerse de acuerdo cuando todavía nadie está afectado. Nuestra guía de reglas del club tiene una lista que puedes usar como punto de partida.",

      { h: "6. Asigna los turnos" },
      "Decide el orden en que los miembros reciben el fondo —por sorteo, por necesidad o por acuerdo— y anúncialo a todos antes de empezar. El orden importa más de lo que parece, porque un turno temprano y uno tardío son posiciones muy distintas; la guía sobre el orden de los turnos explica por qué.",

      { h: "7. Decide cómo se mueve el dinero" },
      "Hay dos formas habituales: los miembros le envían la cuota al organizador, que entrega el fondo a quien le toca ese ciclo; o los miembros le pagan directamente a quien recibe. Las dos funcionan, siempre que todos sepan cuál usa el club y qué métodos de pago se aceptan.",
      "Elijas la que elijas, pide comprobante de cada pago: una captura de la transferencia o un recibo firmado si es en efectivo.",

      { h: "8. Lleva un registro que todos puedan ver" },
      "De cada pago anota quién pagó, cuánto, en qué fecha, por qué método y dónde está el comprobante. Un registro que solo ve el organizador invita a la duda; uno que cualquier miembro puede consultar evita la mayoría de las discusiones antes de que empiecen.",

      { h: "9. Entrega cada turno y cierra el ciclo" },
      "Cuando estén las cuotas de un ciclo, entrega el fondo a quien le toca y marca ese ciclo como terminado. Repite hasta el último turno. Cuando se entrega, el club está completo y el grupo puede decidir si empieza otra ronda con los mismos miembros.",

      { h: "Lista de comprobación antes de empezar" },
      {
        ul: [
          "Todos conocen la cuota, la frecuencia y cuántos turnos tiene el club.",
          "Están fijadas la fecha de pago y la fecha de entrega de cada ciclo.",
          "Están por escrito las reglas sobre pagos atrasados y sobre salir del club.",
          "Cada miembro conoce su turno.",
          "El grupo acordó cómo se envían los pagos y qué cuenta como comprobante.",
          "Hay un solo lugar donde se registran todos los pagos.",
        ],
      },

      { h: "Cómo hacerlo con SanSavingClub" },
      {
        ol: [
          "Crea el club con su nombre, su cuota y el monto total. La app calcula cuántos turnos caben.",
          "Elige la primera fecha de pago y de entrega. Los ciclos siguientes se repiten a partir de ahí.",
          "Comparte el código de invitación para que los miembros se unan.",
          "Asigna los turnos o sortéalos entre los miembros que todavía no tienen uno.",
          "Activa el club. A partir de ahí, los miembros reportan cada pago con su comprobante y tú lo apruebas.",
          "Cuando hayas entregado un turno, marca la entrega como realizada para cerrar el ciclo y abrir el siguiente.",
        ],
      },
      "Si tu club ya está en marcha, puedes agregarlo como club en curso y continuar desde el ciclo en el que va.",
    ],
  },
};
