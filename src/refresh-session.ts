import ExecutionEnvironment from "@docusaurus/core/lib/client/exports/ExecutionEnvironment";

if (ExecutionEnvironment.canUseDOM) {
  function refreshSession(reason: string) {
    const analytics = window.analytics;
    if (analytics) {
      analytics.track(
        "Session Expired",
        {
          category: "System",
          label: window.location.pathname,
          value: reason,
        },
        function callback() {
          window.location.reload();
        }
      );
    } else {
      window.location.reload();
    }
  }

  window.addEventListener(
    "unhandledrejection",
    function (promiseRejectionEvent) {
      if (promiseRejectionEvent.reason.name === "ChunkLoadError") {
        refreshSession("ChunkLoadError");
        return true;
      }
      return false;
    }
  );

  window.addEventListener("error", function (event) {
    if (event.message === "Uncaught SyntaxError: Unexpected token '<'") {
      refreshSession("SyntaxError");
      return true;
    }
    return false;
  });
}
