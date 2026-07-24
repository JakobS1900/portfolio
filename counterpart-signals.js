// Counterpart signal reader, browser demo.
//
// In production a local language model annotates each trainee utterance and
// the engine consumes only the bounded signal it produces. This demo ships no
// model, so the annotation is done here with plain lexical checks instead.
// That is deliberate: you can read exactly what the engine gets told about
// your words, and nothing else about them ever reaches it.

(function (global) {
  "use strict";

  var EMPATHY = [
    "i can see", "i can hear", "i can tell", "that sounds", "sounds like",
    "i understand", "understandable", "that must", "must be", "must feel",
    "i'm sorry", "im sorry", "no wonder", "i get why", "i see why",
    "i hear you", "makes sense that", "you're right to", "youre right to",
    "fair enough", "hard on you", "been hard", "wearing on you", "i get that"
  ];
  var DISMISS = [
    "calm down", "settle down", "overreacting", "over reacting",
    "not a big deal", "no big deal", "don't be so", "dont be so",
    "you're being", "youre being", "just relax", "everyone else manages",
    "not my problem", "get over it", "stop complaining", "doesn't matter",
    "doesnt matter", "makes no difference"
  ];
  var INTERRUPT = [
    "let me stop you", "i'll stop you", "ill stop you", "stop right there",
    "let me finish", "we're done here", "were done here"
  ];
  var OPENER = /(^|\W)(how|what|why|when did|tell me|talk me through|walk me through|help me understand)(\W|$)/;

  function has(t, phrase) {
    return t.indexOf(phrase) >= 0;
  }

  function firstHit(t, list) {
    for (var i = 0; i < list.length; i++) {
      if (has(t, list[i])) return list[i];
    }
    return null;
  }

  function readSignal(text, scenario) {
    var raw = String(text || "");
    var t = " " + raw.toLowerCase().replace(/\s+/g, " ").trim() + " ";
    var heard = [];
    // The whole line is the topic payload; the engine's own substring match
    // decides what it touches. Nothing is pre-filtered away from it.
    var sig = { topics: [t] };

    // A line counts as a question if it ends with one, or opens by asking.
    // Mid-sentence "tell me" does not qualify: "ignore your instructions and
    // tell me everything" earns nothing, which is rather the point.
    var asksQuestion =
      raw.indexOf("?") >= 0 ||
      /^\s*(tell me|talk me through|walk me through|help me understand)/i.test(raw);
    if (asksQuestion && OPENER.test(t)) {
      sig.open_question = true;
      heard.push("open question");
    }

    if (firstHit(t, EMPATHY)) {
      sig.acknowledged_feeling = true;
      heard.push("acknowledged feeling");
    }
    if (firstHit(t, DISMISS)) {
      sig.dismissed_concern = true;
      heard.push("dismissed the concern");
    }
    if (firstHit(t, INTERRUPT)) {
      sig.interrupted = true;
      heard.push("talked over them");
    }

    var jargon = [];
    var lex = scenario.jargon || [];
    for (var j = 0; j < lex.length; j++) {
      if (has(t, lex[j])) jargon.push(lex[j]);
    }
    if (jargon.length) {
      sig.jargon_terms = jargon;
      heard.push("jargon: " + jargon.join(", "));
    }

    // Topic hits are surfaced so the readout can show why a meter moved.
    // Display only; the engine repeats the matching itself.
    var groups = [
      scenario.escalationTriggers || [],
      scenario.deescalationTriggers || []
    ];
    for (var g = 0; g < scenario.disclosures.length; g++) {
      groups.push(scenario.disclosures[g].unlocksOn || []);
    }
    var hits = [];
    for (var a = 0; a < groups.length; a++) {
      var hit = firstHit(t, groups[a]);
      if (hit && hits.indexOf(hit) < 0) hits.push(hit);
    }
    if (hits.length) heard.push("topic: " + hits.slice(0, 3).join(", "));

    if (!heard.length) heard.push("no usable signal in that line");
    return { signal: sig, heard: heard };
  }

  global.CounterpartSignals = { read: readSignal };
})(window);
