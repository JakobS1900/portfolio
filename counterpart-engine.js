// Counterpart deterministic engine, browser port.
//
// This mirrors the Python core (simulation.py) that runs the real product.
// Everything that decides an outcome is a pure function of (state, signal).
// The counterpart's wording comes from elsewhere (a language model in
// production, a reply bank in this demo); it never touches these numbers.
//
// The clamp is the whole integrity story: one turn can only move a trait by a
// bounded amount, so no single input, however adversarial, can swing the score.

(function (global) {
  "use strict";

  var MAX_DELTA_PER_TURN = 1.5;
  var MAX_RESISTANCE_DROP_PER_TURN = 12.0;

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  // Bidirectional substring match, case-insensitive: a trigger may be broader
  // than the topic ("money") or narrower ("the deposit we already paid").
  function matchesAny(topics, targets) {
    if (!topics || !targets) return false;
    for (var i = 0; i < topics.length; i++) {
      var t = String(topics[i]).toLowerCase();
      for (var j = 0; j < targets.length; j++) {
        var target = String(targets[j]).toLowerCase();
        if (t.indexOf(target) >= 0 || target.indexOf(t) >= 0) return true;
      }
    }
    return false;
  }

  function initialState(scenario) {
    var b = scenario.behaviour;
    return {
      trust: b.trust,
      agitation: b.agitation,
      resistance: b.resistance,
      unlocked: [], // indices into scenario.disclosures
      met: [], // objective keys
      turn: 0,
      justUnlocked: null,
      log: []
    };
  }

  // Apply one professional utterance. Returns a NEW state object.
  function advance(scenario, state, signal) {
    var sc = scenario;
    var b = sc.behaviour;
    var log = [];
    signal = signal || {};

    var trustDelta = 0;
    var agitationDelta = 0;

    if (signal.open_question) {
      trustDelta += 0.6;
      log.push("open question");
    }
    if (signal.acknowledged_feeling) {
      trustDelta += 0.9;
      agitationDelta -= 1.0;
      log.push("acknowledged feeling");
    }

    var jargon = signal.jargon_terms || [];
    // Jargon only hurts someone who cannot parse it. A specialist counterpart
    // with high comprehension is unbothered: the lesson is audience calibration.
    if (jargon.length && b.comprehension < 6) {
      var penalty = 0.4 * jargon.length;
      trustDelta -= penalty;
      agitationDelta += penalty * 0.5;
      log.push("jargon on a lay listener");
    }

    if (signal.interrupted) {
      agitationDelta += 1.2;
      trustDelta -= 0.5;
      log.push("interrupted");
    }
    if (signal.dismissed_concern) {
      agitationDelta += 1.8;
      trustDelta -= 1.2;
      log.push("dismissed the concern");
    }

    var topics = signal.topics || [];
    if (matchesAny(topics, sc.escalationTriggers)) {
      agitationDelta += 1.0;
      log.push("hit an escalation trigger");
    }
    if (matchesAny(topics, sc.deescalationTriggers)) {
      agitationDelta -= 1.2;
      log.push("de-escalated");
    }

    trustDelta = clamp(trustDelta, -MAX_DELTA_PER_TURN, MAX_DELTA_PER_TURN);
    agitationDelta = clamp(agitationDelta, -MAX_DELTA_PER_TURN, MAX_DELTA_PER_TURN);

    var trust = clamp(state.trust + trustDelta, 0, 10);
    var agitation = clamp(state.agitation + agitationDelta, 0, 10);

    // Resistance falls with earned trust and rises with agitation. Upsetting
    // someone closes them back up even if you were doing well.
    var resistanceDrop = clamp(
      trustDelta * 6.0 - agitationDelta * 4.0,
      -MAX_RESISTANCE_DROP_PER_TURN,
      MAX_RESISTANCE_DROP_PER_TURN
    );
    var resistance = clamp(state.resistance - resistanceDrop, 0, 100);

    var unlocked = state.unlocked.slice();
    var justUnlocked = null;
    for (var d = 0; d < sc.disclosures.length; d++) {
      if (unlocked.indexOf(d) >= 0) continue;
      var disc = sc.disclosures[d];
      // Both gates: the right topic AND earned rapport. Asking the perfect
      // question too early is supposed to fail.
      if (
        matchesAny(topics, disc.unlocksOn) &&
        resistance <= disc.requiresResistanceBelow
      ) {
        unlocked.push(d);
        justUnlocked = d;
        log.push("disclosure unlocked");
      }
    }

    var met = state.met.slice();
    var nextTurn = state.turn + 1;
    for (var o = 0; o < sc.objectives.length; o++) {
      var key = sc.objectives[o].key;
      if (met.indexOf(key) >= 0) continue;
      if (objectiveMet(key, signal, unlocked, resistance, nextTurn)) {
        met.push(key);
        log.push("objective: " + key);
      }
    }

    return {
      trust: trust,
      agitation: agitation,
      resistance: resistance,
      unlocked: unlocked,
      met: met,
      turn: nextTurn,
      justUnlocked: justUnlocked,
      log: log
    };
  }

  function objectiveMet(key, signal, unlocked, resistance, turn) {
    switch (key) {
      case "used-open-questions":
        return !!signal.open_question;
      case "acknowledged-emotion":
        return !!signal.acknowledged_feeling;
      case "avoided-jargon":
        // Only creditable once there has been a chance to fail it.
        return turn >= 3 && !(signal.jargon_terms && signal.jargon_terms.length);
      case "elicited-hidden-concern":
        return unlocked.length > 0;
      case "built-rapport":
        return resistance <= 30;
      default:
        return false;
    }
  }

  function scoreSession(scenario, state) {
    var objs = scenario.objectives;
    if (!objs.length) {
      return { score: 0, passed: false, met: [], missed: [], failedCritical: [] };
    }
    var total = 0,
      earned = 0,
      missed = [],
      failedCritical = [];
    for (var i = 0; i < objs.length; i++) {
      total += objs[i].weight;
      if (state.met.indexOf(objs[i].key) >= 0) {
        earned += objs[i].weight;
      } else {
        missed.push(objs[i].key);
        if (objs[i].critical) failedCritical.push(objs[i].key);
      }
    }
    var score = total ? Math.round((earned / total) * 100) : 0;
    // A missed critical objective fails the session outright.
    var passed = score >= 70 && failedCritical.length === 0;
    return {
      score: score,
      passed: passed,
      met: state.met.slice(),
      missed: missed,
      failedCritical: failedCritical
    };
  }

  global.CounterpartEngine = {
    initialState: initialState,
    advance: advance,
    scoreSession: scoreSession,
    MAX_DELTA_PER_TURN: MAX_DELTA_PER_TURN
  };
})(window);
