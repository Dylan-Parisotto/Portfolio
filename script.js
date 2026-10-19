// Portfolio interactions: mobile menu, current-section highlight,
// headshot fallback, copy-email button, and the Issue Tracker API replay.
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function closeMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") closeMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Highlight the section you're reading ---------- */
  var navLinks = nav.querySelectorAll("a");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.classList.toggle("is-current", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ["about", "skills", "projects", "contact"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  /* ---------- Headshot fallback until headshot.jpg is added ---------- */
  var headshot = document.querySelector(".headshot");
  var photo = headshot.querySelector("img");
  function showFallback() { headshot.classList.add("no-photo"); }
  photo.addEventListener("error", showFallback);
  if (photo.complete && photo.naturalWidth === 0) showFallback();

  /* ---------- Copy email ---------- */
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = "Copy"; }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { btn.textContent = "Press Ctrl+C"; });
      } else {
        var temp = document.createElement("textarea");
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        try { document.execCommand("copy"); done(); } catch (err) { btn.textContent = "Press Ctrl+C"; }
        document.body.removeChild(temp);
      }
    });
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Issue Tracker API replay ----------
     These requests and responses match what my real Express + MongoDB API
     returns (see labs/module4/lab 04-03 in my GitHub repo). No server runs
     here; the page shows the recorded results. */
  var ISSUE_ID = "6720f3a1c4b8e91d2a7f0b3e";

  var baseIssue = {
    _id: ISSUE_ID,
    title: "Login button does nothing",
    description: "Clicking Log in on the home page has no effect.",
    stepsToReproduce: "1. Open the home page 2. Click Log in",
    priority: "high",
    status: "open",
    classification: "unclassified",
    author: { userId: "placeholder-user-001", fullName: "Lab Placeholder User" },
    createdOn: "2026-10-05T14:32:10.512Z",
    comments: [],
    testCases: [],
    timeLog: []
  };

  function withChanges(changes) {
    var copy = JSON.parse(JSON.stringify(baseIssue));
    Object.keys(changes).forEach(function (key) { copy[key] = changes[key]; });
    return copy;
  }

  var requests = {
    create: {
      method: "POST",
      path: "/issues",
      body: {
        title: "Login button does nothing",
        description: "Clicking Log in on the home page has no effect.",
        stepsToReproduce: "1. Open the home page 2. Click Log in",
        priority: "high",
        author: "someone-else"
      },
      note: "The client tried to set the author. The server ignores it.",
      status: "201 Created",
      ok: true,
      response: baseIssue
    },
    missing: {
      method: "POST",
      path: "/issues",
      body: {
        description: "Clicking Log in on the home page has no effect.",
        stepsToReproduce: "1. Open the home page 2. Click Log in",
        priority: "high"
      },
      status: "400 Bad Request",
      ok: false,
      response: {
        error: "ValidationFailed",
        details: [{ path: "title", message: "Invalid input: expected string, received undefined" }]
      }
    },
    priority: {
      method: "POST",
      path: "/issues",
      body: {
        title: "Login button does nothing",
        description: "Clicking Log in on the home page has no effect.",
        stepsToReproduce: "1. Open the home page 2. Click Log in",
        priority: "urgent"
      },
      status: "400 Bad Request",
      ok: false,
      response: {
        error: "ValidationFailed",
        details: [{ path: "priority", message: "Invalid option: expected one of \"low\"|\"medium\"|\"high\"" }]
      }
    },
    status: {
      method: "PATCH",
      path: "/issues/" + ISSUE_ID + "/status",
      body: { status: "in-progress" },
      status: "200 OK",
      ok: true,
      response: withChanges({ status: "in-progress" })
    },
    comment: {
      method: "POST",
      path: "/issues/" + ISSUE_ID + "/comments",
      body: { comment: "I can reproduce this in Chrome and Edge." },
      status: "201 Created",
      ok: true,
      response: withChanges({
        status: "in-progress",
        comments: [{
          _id: "3f9c2b1e-7a4d-4c8e-9b21-5d6e0f1a2b3c",
          userId: "placeholder-user-001",
          fullName: "Lab Placeholder User",
          comment: "I can reproduce this in Chrome and Edge.",
          createdOn: "2026-10-05T14:40:02.118Z"
        }]
      })
    }
  };

  // Escape text, then colour keys, strings and numbers.
  function highlight(obj) {
    var json = JSON.stringify(obj, null, 2)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return json.replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null|-?\d+(?:\.\d+)?)\b/g, function (match, str, colon, lit) {
      if (str) return colon ? '<span class="k">' + str + "</span>" + colon : '<span class="s">' + str + "</span>";
      return '<span class="n">' + lit + "</span>";
    });
  }

  var reqEl = document.getElementById("console-request");
  var resEl = document.getElementById("console-response");
  var statusEl = document.getElementById("console-status");
  var buttons = document.querySelectorAll(".req");

  function show(key) {
    var r = requests[key];
    var head = r.method + " " + r.path;
    reqEl.innerHTML = head + "\n" + highlight(r.body) + (r.note ? "\n\n// " + r.note : "");
    statusEl.textContent = r.status;
    statusEl.className = "status-pill " + (r.ok ? "ok" : "err");
    resEl.innerHTML = highlight(r.response);

    resEl.classList.remove("flash");
    void resEl.offsetWidth; // restart the animation
    resEl.classList.add("flash");

    buttons.forEach(function (b) {
      var active = b.getAttribute("data-req") === key;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () { show(b.getAttribute("data-req")); });
  });

  show("create");
  resEl.classList.remove("flash");
})();
