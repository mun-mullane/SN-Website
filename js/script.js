/* ============================================
   Shaun Naufahu — site behaviour
   1. Contact mailto, assembled at runtime so the address never
      appears as a scrapable string in the static HTML.
   2. Dot glisten: each dot independently drifts to ~25% opacity
      and back at random intervals (respects prefers-reduced-motion).
   3. Kuli reveal: clicking the dog fades the background image in
      and dips the dog to red; clicking again reverts.
   ============================================ */

(function () {
  "use strict";

  /* ---------- 1. Contact mailto ---------- */
  var mail = document.getElementById("contact-mail");
  if (mail) {
    var u = "info";
    var d = ["snaufahu", "com"].join(".");
    mail.setAttribute("href", "mailto:" + u + "@" + d);
  }

  /* ---------- 3. Kuli reveal ---------- */
  var kuli = document.querySelector(".kuli");
  if (kuli) {
    kuli.addEventListener("click", function () {
      document.body.classList.toggle("reveal");
    });
    kuli.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        document.body.classList.toggle("reveal");
      }
    });
  }

  /* ---------- 2. Dot glisten ---------- */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return; // no motion for users who've asked for none

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
})();
