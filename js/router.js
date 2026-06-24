/* ============================================================================
   WF-015 FOLK — Hash router (client-side, session-persistent)
   ========================================================================== */
(function (FOLK) {
  "use strict";

  const routes = [];          // { pattern: RegExp, keys: [], handler }
  let notFound = null;
  let current = { path: "", params: {} };

  const router = {
    add(path, handler) {
      const keys = [];
      const pattern = new RegExp(
        "^" + path.replace(/:[^/]+/g, (m) => { keys.push(m.slice(1)); return "([^/]+)"; }) + "$"
      );
      routes.push({ pattern, keys, handler });
      return this;
    },
    setNotFound(fn) { notFound = fn; },
    current() { return current; },

    navigate(path) {
      if (("#" + path) === location.hash) { this.resolve(); }
      else location.hash = "#" + path;
    },

    resolve() {
      let hash = location.hash.replace(/^#/, "") || "/home";
      FOLK.c.closeOverlay();
      for (const r of routes) {
        const m = hash.match(r.pattern);
        if (m) {
          const params = {};
          r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
          current = { path: hash, params };
          r.handler(params);
          const main = document.querySelector(".main");
          if (main) main.scrollTop = 0;
          return;
        }
      }
      if (notFound) notFound(hash);
    },

    start() {
      window.addEventListener("hashchange", () => this.resolve());
      this.resolve();
    },
  };

  FOLK.router = router;
})(window.FOLK = window.FOLK || {});
