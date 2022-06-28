import { SessionRefresher } from "../refresh-session";

type ErrorEventFunction = (
  event: PromiseRejectionEvent | ErrorEvent
) => boolean;

enum EventListenerType {
  UnhandledRejection = "unhandledrejection",
  Error = "error",
}

describe("SessionRefresher", () => {
  test("reloadOrRedirect - no config", () => {
    const window = {
      location: {
        reload: jest.fn(),
      },
    } as unknown as Window;
    const sessionRefresher = new SessionRefresher(window);
    sessionRefresher.reloadOrRedirect();
    expect(window.location.reload).toHaveBeenCalled();
  });

  test("reloadOrRedirect - redirectUrl configured", () => {
    const window = {
      location: {
        href: "",
      },
      docusaurusPluginRefreshSession: {
        redirectUrl: "/login",
      },
    } as unknown as Window;
    const sessionRefresher = new SessionRefresher(window);
    sessionRefresher.reloadOrRedirect();
    expect(window.location.href).toEqual("/login");
  });

  test("refreshSession - no analytics", () => {
    const window = {} as unknown as Window;
    const sessionRefresher = new SessionRefresher(window);
    sessionRefresher.reloadOrRedirect = jest.fn();
    sessionRefresher.refreshSession("ChunkLoadError");
    expect(sessionRefresher.reloadOrRedirect).toHaveBeenCalled();
  });

  test("refreshSession - analytics", () => {
    const window = {
      analytics: {
        track: jest.fn(),
      },
      location: {
        pathname: "/",
      },
    } as unknown as Window;
    const sessionRefresher = new SessionRefresher(window);
    sessionRefresher.refreshSession("ChunkLoadError");
    expect((window as any).analytics.track).toHaveBeenCalledWith(
      "Session Expired",
      {
        category: "System",
        label: "/",
        value: "ChunkLoadError",
      },
      expect.any(Function)
    );
  });

  test("install - event listeners installed", () => {
    const window = {
      addEventListener: jest.fn(),
    } as unknown as Window;
    const sessionRefresher = new SessionRefresher(window);
    sessionRefresher.install();

    expect(window.addEventListener).toHaveBeenCalledWith(
      "unhandledrejection",
      expect.any(Function)
    );

    expect(window.addEventListener).toHaveBeenCalledWith(
      "error",
      expect.any(Function)
    );
  });

  function testListener<EventType extends PromiseRejectionEvent | ErrorEvent>(
    event: EventType,
    listenerType: EventListenerType,
    expectedResult: boolean
  ): void {
    let eventListener: ErrorEventFunction | undefined;

    const window = {
      addEventListener: (eventName: string, listener: ErrorEventFunction) => {
        if (eventName === listenerType) {
          eventListener = listener;
        }
      },
    } as unknown as Window;

    const sessionRefresher = new SessionRefresher(window);
    sessionRefresher.install();
    sessionRefresher.refreshSession = jest.fn();

    expect(eventListener).toBeDefined();
    const listener = eventListener as ErrorEventFunction;
    expect(listener(event)).toBe(expectedResult);

    if (expectedResult) {
      expect(sessionRefresher.refreshSession).toHaveBeenCalledWith(
        listenerType === EventListenerType.UnhandledRejection
          ? "ChunkLoadError"
          : "SyntaxError"
      );
    } else {
      expect(sessionRefresher.refreshSession).not.toHaveBeenCalled();
    }
  }

  test("install - unhandledrejection ignores irrelevant errors", () => {
    testListener<PromiseRejectionEvent>(
      {
        reason: {
          name: "SomeWeirdError",
        },
      } as PromiseRejectionEvent,
      EventListenerType.UnhandledRejection,
      false
    );
  });

  test("install - unhandledrejection refreshes the session on a ChunkLoadError", () => {
    testListener<PromiseRejectionEvent>(
      {
        reason: {
          name: "ChunkLoadError",
        },
      } as PromiseRejectionEvent,
      EventListenerType.UnhandledRejection,
      true
    );
  });

  test("install - error ignores irrelevant errors", () => {
    testListener<ErrorEvent>(
      {
        message: "Some weird error happened.",
      } as ErrorEvent,
      EventListenerType.Error,
      false
    );
  });

  test("install - error refreshes the session on an unexpected token", () => {
    testListener<ErrorEvent>(
      {
        message: "Uncaught SyntaxError: Unexpected token '<'",
      } as ErrorEvent,
      EventListenerType.Error,
      true
    );
  });
});
