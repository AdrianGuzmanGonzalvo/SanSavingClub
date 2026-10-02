import type { Guide } from "../types";

export const turnOrder: Guide = {
  slug: "turn-order",
  updated: "2026-10-02",
  en: {
    title: "How to decide the order of turns in a savings club",
    description:
      "The first turn and the last turn of a san are very different positions. What each one means, the usual ways of assigning turns, and how to keep the order fair.",
    blocks: [
      "In a san everybody pays the same and receives the same, so it is tempting to think the order of turns does not matter. It does. The order decides who gets the money early, who waits, and who carries the risk if a member stops paying.",

      { h: "What an early turn and a late turn mean" },
      "Take a club of ten members paying $100 a month, with a pot of $1,000. This is each member's position on the day they receive, assuming they also pay their quota that month:",
      {
        table: {
          head: ["Turn", "Paid in so far", "Receives", "Still to pay afterwards"],
          rows: [
            ["1", "$100", "$1,000", "$900"],
            ["3", "$300", "$1,000", "$700"],
            ["5", "$500", "$1,000", "$500"],
            ["8", "$800", "$1,000", "$200"],
            ["10", "$1,000", "$1,000", "$0"],
          ],
        },
      },
      {
        ul: [
          "An early turn works like an advance from the group. The member receives money they have not finished paying in, and spends the rest of the club paying it back, without interest.",
          "A late turn works like savings. The member has paid almost everything in before receiving anything.",
          "The risk runs in the same direction. If someone stops paying halfway through, the members who have not received yet are the ones affected.",
        ],
      },
      "So an early turn is a benefit and a responsibility at the same time: the rest of the group is trusting that member to keep paying for many more cycles.",

      { h: "Common ways to assign turns" },
      {
        ul: [
          "Random draw. The simplest and the hardest to argue with. Do it in front of everyone, or with a tool whose result all members can see.",
          "By need. A member with a known expense on a known date — a tuition payment, a deposit, a trip — takes the turn closest to it, if the group agrees.",
          "By agreement. Members state which turns they prefer and the group settles the overlaps. Some people actively prefer a late turn because it forces them to save.",
          "By trust. Members the group knows well go first, and new members take later turns in their first club. This limits the damage if someone the group barely knows turns out not to be reliable.",
          "A turn for the organizer. Some groups give the organizer the first turn in recognition of the work; others put the organizer last, as a sign that they are backing the club. Neither is the rule — it is something to decide openly.",
        ],
      },
      "Many clubs combine methods: one or two turns are fixed by agreement and the rest are drawn.",

      { h: "Swapping turns" },
      "Circumstances change during a club that lasts months, and two members may want to trade turns. It is reasonable to allow it under three conditions: both members agree, the organizer is told before the cycle in question, and the change is written down where everyone can see it. A swap that only two people know about is a dispute waiting to happen.",

      { h: "Keeping it fair" },
      {
        ul: [
          "Set the order before the first payment, not as you go.",
          "Explain the method to everyone, even if the result is obvious.",
          "Publish the full list of turns with their dates.",
          "Do not change the order after the club starts unless the affected members agree.",
        ],
      },

      { h: "Turns in SanSavingClub" },
      "The organizer assigns each member a turn number from the club's admin panel. The Randomize Turns option draws turns only for members who do not have one yet, without touching those already assigned, so you can fix some turns by agreement and draw the rest. Once the club is active, every member can see the order and the payout dates in the calendar.",
    ],
  },
  es: {
    title: "Cómo decidir el orden de los turnos en un club de ahorro",
    description:
      "El primer turno y el último de un san son posiciones muy distintas. Qué significa cada uno, las formas habituales de repartir los turnos y cómo mantener el orden justo.",
    blocks: [
      "En un san todos pagan lo mismo y reciben lo mismo, así que es fácil pensar que el orden de los turnos no importa. Sí importa. El orden decide quién recibe el dinero pronto, quién espera y quién carga con el riesgo si un miembro deja de pagar.",

      { h: "Qué significa un turno temprano y uno tardío" },
      "Piensa en un club de diez miembros que pagan $100 al mes, con un fondo de $1,000. Esta es la posición de cada miembro el día que recibe, suponiendo que también paga su cuota ese mes:",
      {
        table: {
          head: ["Turno", "Aportado hasta entonces", "Recibe", "Le queda por pagar"],
          rows: [
            ["1", "$100", "$1,000", "$900"],
            ["3", "$300", "$1,000", "$700"],
            ["5", "$500", "$1,000", "$500"],
            ["8", "$800", "$1,000", "$200"],
            ["10", "$1,000", "$1,000", "$0"],
          ],
        },
      },
      {
        ul: [
          "Un turno temprano funciona como un adelanto del grupo. El miembro recibe dinero que todavía no ha terminado de aportar y pasa el resto del club devolviéndolo, sin intereses.",
          "Un turno tardío funciona como un ahorro. El miembro ha aportado casi todo antes de recibir nada.",
          "El riesgo va en la misma dirección. Si alguien deja de pagar a mitad del club, los afectados son los miembros que todavía no han recibido.",
        ],
      },
      "Por eso un turno temprano es un beneficio y una responsabilidad a la vez: el resto del grupo confía en que ese miembro seguirá pagando durante muchos ciclos más.",

      { h: "Formas habituales de repartir los turnos" },
      {
        ul: [
          "Sorteo. La más sencilla y la más difícil de discutir. Hazlo delante de todos o con una herramienta cuyo resultado puedan ver todos los miembros.",
          "Por necesidad. Un miembro con un gasto conocido en una fecha conocida —una matrícula, un depósito, un viaje— toma el turno más cercano, si el grupo está de acuerdo.",
          "Por acuerdo. Los miembros dicen qué turnos prefieren y el grupo resuelve las coincidencias. Hay quien prefiere un turno tardío precisamente porque le obliga a ahorrar.",
          "Por confianza. Los miembros que el grupo conoce bien van primero y los nuevos toman turnos posteriores en su primer club. Así se limita el daño si alguien a quien el grupo apenas conoce resulta no ser cumplidor.",
          "Un turno para el organizador. Algunos grupos le dan el primer turno al organizador en reconocimiento a su trabajo; otros lo ponen de último, como señal de que respalda el club. Ninguna de las dos es la norma: es algo que se decide abiertamente.",
        ],
      },
      "Muchos clubes combinan métodos: uno o dos turnos se fijan por acuerdo y el resto se sortea.",

      { h: "Intercambiar turnos" },
      "Las circunstancias cambian en un club que dura meses, y puede que dos miembros quieran intercambiar sus turnos. Es razonable permitirlo con tres condiciones: que los dos estén de acuerdo, que el organizador lo sepa antes del ciclo en cuestión y que el cambio quede anotado donde todos puedan verlo. Un intercambio que solo conocen dos personas es una discusión a punto de ocurrir.",

      { h: "Cómo mantenerlo justo" },
      {
        ul: [
          "Fija el orden antes del primer pago, no sobre la marcha.",
          "Explica el método a todos, aunque el resultado parezca obvio.",
          "Publica la lista completa de turnos con sus fechas.",
          "No cambies el orden una vez empezado el club, salvo que los miembros afectados estén de acuerdo.",
        ],
      },

      { h: "Los turnos en SanSavingClub" },
      "El organizador le asigna a cada miembro un número de turno desde el panel de administración del club. La opción Sortear turnos reparte turnos solo entre los miembros que todavía no tienen uno, sin tocar los ya asignados, de modo que puedes fijar algunos por acuerdo y sortear el resto. Cuando el club está activo, cada miembro puede ver el orden y las fechas de entrega en el calendario.",
    ],
  },
};
