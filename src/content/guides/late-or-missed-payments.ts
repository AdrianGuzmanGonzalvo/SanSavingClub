import type { Guide } from "../types";

export const lateOrMissedPayments: Guide = {
  slug: "late-or-missed-payments",
  updated: "2026-10-02",
  en: {
    title: "What to do when someone pays late or stops paying",
    description:
      "A late quota, a member who needs to leave, a member who has already received and stops paying: how an organizer can handle each case without letting it sink the club.",
    blocks: [
      "Sooner or later every organizer faces a payment that does not arrive. How it is handled in the first few days usually decides whether it stays a small delay or becomes a problem for the whole group.",
      "The three situations below are very different, and it helps to be clear about which one you are in.",

      { h: "Before anything happens: prevention" },
      {
        ul: [
          "Set a quota that every member can pay comfortably for the whole club.",
          "Send a reminder a few days before each due date, not on the day.",
          "Leave a gap between the due date and the payout date, so a short delay does not push back the turn.",
          "Agree in advance on the grace period and on what happens after it.",
          "Give new members later turns in their first club.",
        ],
      },

      { h: "Case 1: a payment is a few days late" },
      "This is the common case and usually has an ordinary explanation. Contact the member privately and early — the day after the due date, not a week later. Ask for a specific date rather than accepting \"soon\".",
      "Apply whatever the group agreed: if there is a grace period, it runs; if there is a late fee after it, it applies. Applying the rule the same way to everyone is what keeps it from feeling personal.",
      "If the delay might affect the payout, tell the member whose turn it is before the payout date. People accept a delay they were warned about far better than one they discover on their own.",

      { h: "Case 2: a member needs to leave before receiving their turn" },
      "This is the simplest of the difficult cases, because that member has only put money in. The group has two ways forward:",
      {
        ul: [
          "Replace them. A new member takes over the turn and continues paying from the current cycle. The group agrees with the new member how the quotas already paid by the person leaving are settled.",
          "Shrink the club. The club continues with one member less, which means one turn less and a smaller pot from that point on. Because the members who already received got the larger pot, the group has to agree on how to even that out.",
        ],
      },
      "Replacing the member keeps the numbers intact and is usually the cleaner option. In both cases, return what the departing member paid in according to the rule the club set at the start — some groups return it right away, others when the club ends.",

      { h: "Case 3: a member who already received stops paying" },
      "This is the case that damages clubs, because that member is holding money that belongs to the people still waiting for their turn. They owe the group the quotas that remain.",
      {
        ol: [
          "Talk to them directly and soon. Find out whether it is a temporary difficulty or a decision not to pay.",
          "If it is temporary, agree on a payment plan in writing, with dates and amounts, even if it is only a message both of you can refer back to.",
          "Tell the rest of the group. They are the ones affected and they are entitled to know.",
          "Decide together how the shortfall is covered while the debt is outstanding. The usual options are that the remaining pots are smaller by one quota, or that the group splits the missing quota among the members.",
          "Keep every record: payments, receipts, messages and the plan you agreed on. If the group later decides to pursue the debt formally, that record is what it will rely on.",
        ],
      },
      {
        note: "What a group can do to recover an unpaid debt depends on the laws of the place where you live. This guide is general information, not legal advice.",
      },

      { h: "What not to do" },
      {
        ul: [
          "Do not cover the missing payments from your own pocket without telling anyone. It hides the problem and leaves you carrying it alone.",
          "Do not expose the member in front of people outside the club. It rarely gets the money back and it makes an agreement harder.",
          "Do not change the rules on your own halfway through. If the situation needs a new rule, the group decides it.",
          "Do not let it drift. A debt that nobody mentions for two months is much harder to settle than one addressed in the first week.",
        ],
      },

      { h: "Why the record matters" },
      "In every one of these cases, the first question is the same: who has paid what, and when. If the answer depends on someone's memory or on scrolling through a chat, the conversation starts with an argument about the facts.",
      "In SanSavingClub each payment is reported with its date, amount, method and proof, and approved by the organizer, so the payment history of every member is there when it is needed. The club's settings also hold the grace period and the late fee the group agreed on.",
    ],
  },
  es: {
    title: "Qué hacer cuando alguien paga tarde o deja de pagar",
    description:
      "Una cuota atrasada, un miembro que necesita salir, un miembro que ya recibió y deja de pagar: cómo puede manejar el organizador cada caso sin que hunda el club.",
    blocks: [
      "Tarde o temprano, todo organizador se encuentra con un pago que no llega. La forma de manejarlo en los primeros días suele decidir si se queda en un pequeño retraso o se convierte en un problema para todo el grupo.",
      "Las tres situaciones que siguen son muy distintas, y ayuda tener claro en cuál estás.",

      { h: "Antes de que pase nada: prevención" },
      {
        ul: [
          "Fija una cuota que todos los miembros puedan pagar con comodidad durante todo el club.",
          "Envía un recordatorio unos días antes de cada fecha de pago, no el mismo día.",
          "Deja un margen entre la fecha de pago y la de entrega, para que un retraso corto no atrase el turno.",
          "Acuerden por adelantado el período de gracia y qué pasa cuando se termina.",
          "Dales a los miembros nuevos turnos posteriores en su primer club.",
        ],
      },

      { h: "Caso 1: un pago llega unos días tarde" },
      "Es el caso más común y casi siempre tiene una explicación normal. Contacta al miembro en privado y pronto: al día siguiente de la fecha límite, no una semana después. Pide una fecha concreta en lugar de aceptar un «pronto».",
      "Aplica lo que el grupo acordó: si hay período de gracia, corre; si después hay una multa por mora, se aplica. Aplicar la regla igual para todos es lo que evita que parezca algo personal.",
      "Si el retraso puede afectar la entrega, avísale a quien le toca el turno antes de la fecha de entrega. La gente acepta mucho mejor un retraso del que fue avisada que uno que descubre por su cuenta.",

      { h: "Caso 2: un miembro necesita salir antes de recibir su turno" },
      "Es el más sencillo de los casos difíciles, porque ese miembro solo ha puesto dinero. El grupo tiene dos caminos:",
      {
        ul: [
          "Reemplazarlo. Un miembro nuevo toma el turno y sigue pagando desde el ciclo actual. El grupo acuerda con el nuevo miembro cómo se resuelven las cuotas que ya pagó la persona que sale.",
          "Reducir el club. El club sigue con un miembro menos, lo que significa un turno menos y un fondo más pequeño a partir de ese momento. Como los miembros que ya recibieron cobraron el fondo mayor, el grupo tiene que acordar cómo compensarlo.",
        ],
      },
      "Reemplazar al miembro mantiene los números intactos y suele ser la opción más limpia. En los dos casos, devuelve lo que aportó quien sale según la regla que el club fijó al principio: algunos grupos lo devuelven de inmediato y otros cuando termina el club.",

      { h: "Caso 3: un miembro que ya recibió deja de pagar" },
      "Este es el caso que daña a los clubes, porque ese miembro tiene dinero que les corresponde a quienes todavía esperan su turno. Le debe al grupo las cuotas que faltan.",
      {
        ol: [
          "Habla con esa persona directamente y pronto. Averigua si es una dificultad temporal o una decisión de no pagar.",
          "Si es temporal, acuerden un plan de pago por escrito, con fechas y montos, aunque sea un mensaje al que los dos puedan volver.",
          "Avísale al resto del grupo. Son los afectados y tienen derecho a saberlo.",
          "Decidan juntos cómo se cubre el faltante mientras la deuda siga pendiente. Lo habitual es que los fondos restantes sean una cuota más pequeños o que el grupo reparta la cuota que falta entre los miembros.",
          "Guarda todos los registros: pagos, comprobantes, mensajes y el plan que acordaron. Si más adelante el grupo decide reclamar la deuda formalmente, se apoyará en ese registro.",
        ],
      },
      {
        note: "Lo que un grupo puede hacer para recuperar una deuda impaga depende de las leyes del lugar donde vives. Esta guía es información general, no asesoría legal.",
      },

      { h: "Lo que no conviene hacer" },
      {
        ul: [
          "No cubras los pagos que faltan de tu bolsillo sin decírselo a nadie. Esconde el problema y te deja cargando con él a solas.",
          "No expongas al miembro ante personas ajenas al club. Rara vez recupera el dinero y hace más difícil llegar a un acuerdo.",
          "No cambies las reglas por tu cuenta a mitad del club. Si la situación necesita una regla nueva, la decide el grupo.",
          "No lo dejes pasar. Una deuda de la que nadie habla durante dos meses es mucho más difícil de resolver que una que se atiende en la primera semana.",
        ],
      },

      { h: "Por qué importa el registro" },
      "En todos estos casos la primera pregunta es la misma: quién pagó qué y cuándo. Si la respuesta depende de la memoria de alguien o de revisar un chat, la conversación empieza con una discusión sobre los hechos.",
      "En SanSavingClub cada pago se reporta con su fecha, monto, método y comprobante, y lo aprueba el organizador, de modo que el historial de pagos de cada miembro está ahí cuando hace falta. La configuración del club también guarda el período de gracia y la multa por mora que el grupo acordó.",
    ],
  },
};
