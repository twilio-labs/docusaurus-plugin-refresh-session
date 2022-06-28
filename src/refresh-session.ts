const canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

export class SessionRefresher {
  private window: Window;

  constructor(window: Window) {
    this.window = window;
  }

  reloadOrRedirect() {
    const redirectUrl = (this.window as any).docusaurusPluginRefreshSession
      ?.redirectUrl;
    if (redirectUrl) {
      this.window.location.href = redirectUrl;
    } else {
      this.window.location.reload();
    }
  }

  refreshSession(reason: string) {
    const analytics = (this.window as any).analytics;
    if (analytics) {
      analytics.track(
        "Session Expired",
        {
          category: "System",
          label: this.window.location.pathname,
          value: reason,
        },
        () => {
          this.reloadOrRedirect();
        }
      );
    } else {
      this.reloadOrRedirect();
    }
  }

  install() {
    this.window.addEventListener(
      "unhandledrejection",
      (promiseRejectionEvent: PromiseRejectionEvent) => {
        if (promiseRejectionEvent.reason.name === "ChunkLoadError") {
          this.refreshSession("ChunkLoadError");
          return true;
        }
        return false;
      }
    );

    this.window.addEventListener("error", (event: ErrorEvent) => {
      if (event.message === "Uncaught SyntaxError: Unexpected token '<'") {
        this.refreshSession("SyntaxError");
        return true;
      }
      return false;
    });
  }
}

if (canUseDOM) {
  const sessionRefresher = new SessionRefresher(global.window);
  sessionRefresher.install();
}
