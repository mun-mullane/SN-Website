/* ============================================
   Shaun Naufahu — ambient animation
   1. Dot glisten: each dot independently drifts to ~25% opacity
      and back at random intervals.
   2. Word shimmer: words flicker through a small palette on a
      3.19s loop, staggered 60ms per word, easing back to base.
   Both respect prefers-reduced-motion.
   ============================================ */

(function () {
  "use strict";

  /* ---------- Contact mailto (assembled at runtime so the address
     never appears as a scrapable string in the static HTML) ---------- */
  var mail = document.getElementById("contact-mail");
  if (mail) {
    var u = "info";
    var d = ["snaufahu", "com"].join(".");
    mail.setAttribute("href", "mailto:" + u + "@" + d);
  }

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return; // no motion for users who've asked for none

  /* ---------- 1. Dot glisten ---------- */

  var dots = document.querySelectorAll(".fetu .dot");

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function glisten(dot) {
    // Wait a random interval, dim slowly, then return; repeat forever.
    var wait = rand(1500, 9000);           // random pause before each drift
    setTimeout(function () {
      dot.style.opacity = rand(0.22, 0.3); // drift down to ~25%
      // The CSS transition (2.6s) carries it down; hold briefly, come back.
      setTimeout(function () {
        dot.style.opacity = 1;
        setTimeout(function () { glisten(dot); }, 2700); // after fade-back, loop
      }, rand(2700, 4200));
    }, wait);
  }

  dots.forEach(function (dot) {
    // Desynchronise from the start so page load doesn't pulse in unison
    setTimeout(function () { glisten(dot); }, rand(0, 4000));
  });

  /* ---------- 2. Word shimmer ---------- */

  var CYCLE = 3190;          // total timeline per cycle (ms)
  var STAGGER = 60;          // per-word offset (ms)
  /* Pearlescent glints: ink, its tint, warm sand, and a sand-weight
     tone with a subtle green cast. Lightest stops sit near the sand
     so nothing washes out against the background. */
  var PALETTE = ["#4A2105", "#A49082", "#D9C6B2", "#D3D8C4"];
  var BASE = "";             // empty string -> inherits base text colour

  // Wrap every word in .intro-body in a span (title is excluded)
  var words = [];
  document.querySelectorAll(".intro-body").forEach(function (el) {
    var parts = el.textContent.split(/(\s+)/); // keep whitespace tokens
    el.textContent = "";
    parts.forEach(function (part) {
      if (/^\s+$/.test(part) || part === "") {
        el.appendChild(document.createTextNode(part));
      } else {
        var span = document.createElement("span");
        span.className = "shimmer-word";
        span.textContent = part;
        el.appendChild(span);
        words.push(span);
      }
    });
  });

  function shimmerWord(span) {
    // 2–6 brief glints at random points in the cycle. Each glint eases
    // to a palette colour and releases back to base a moment later —
    // light rolling over a facet, not a held colour.
    var glints = 2 + Math.floor(Math.random() * 5); // 2..6
    for (var i = 0; i < glints; i++) {
      (function () {
        var at = rand(0, CYCLE - 900);
        var colour = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        timers.push(setTimeout(function () { span.style.color = colour; }, at));
        timers.push(setTimeout(function () { span.style.color = BASE; }, at + rand(90, 220)));
      })();
    }
    // Safety net: everything is at base by cycle end
    timers.push(setTimeout(function () { span.style.color = BASE; }, CYCLE - 650));
  }

  function runCycle() {
    words.forEach(function (span, i) {
      timers.push(setTimeout(function () { shimmerWord(span); }, i * STAGGER));
    });
  }

  /* Shimmer runs only while the pointer is over the text block.
     On leave: all pending flickers are cancelled and every word
     eases back to base via the existing colour transition. */
  var timers = [];
  var loop = null;
  var intro = document.querySelector(".intro");

  intro.addEventListener("mouseenter", function () {
    runCycle();
    loop = setInterval(runCycle, CYCLE + words.length * STAGGER);
  });

  intro.addEventListener("mouseleave", function () {
    clearInterval(loop);
    timers.forEach(clearTimeout);
    timers = [];
    words.forEach(function (span) { span.style.color = BASE; });
  });
})();
