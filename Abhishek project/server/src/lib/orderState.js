/**
 * Order state machine.
 * Pure functions, no DB access - keeps transition logic testable and
 * gives one canonical place to answer "what can happen to an order?"
 */

const STATUSES = Object.freeze(['received', 'ready_for_shipping', 'out_for_delivery', 'cancelled']);

// Allowed transitions: from -> [to, to, ...]
const TRANSITIONS = Object.freeze({
  received: ['ready_for_shipping', 'cancelled'],
  ready_for_shipping: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['cancelled'],
  cancelled: [],
});

function canTransition(from, to) {
  if (!STATUSES.includes(from) || !STATUSES.includes(to)) return false;
  return TRANSITIONS[from].includes(to);
}

function nextAllowed(from) {
  return TRANSITIONS[from] ? [...TRANSITIONS[from]] : [];
}

function isTerminal(status) {
  return TRANSITIONS[status]?.length === 0;
}

module.exports = { STATUSES, TRANSITIONS, canTransition, nextAllowed, isTerminal };
