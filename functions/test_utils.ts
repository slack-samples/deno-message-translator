import { type Stub, stub } from "@std/testing/mock";

interface StubRequestHandler {
  assertion: (req: Request) => void | Promise<void>;
  response: Response;
}

export class UnmatchedRequestError extends Error {
  request: Request;

  constructor(request: Request) {
    const method = request.method;
    const url = request.url;
    const headers = JSON.stringify(Object.fromEntries([...request.headers]));

    super(`No stub found for ${method} ${url}\nHeaders: ${headers}`);
    this.name = "UnmatchedRequestError";
    this.request = request;
  }
}

export class StubFetch {
  private stubs: Map<string, StubRequestHandler> = new Map();
  private stubFetchInstance: Stub | null = null;

  constructor() {
    this.install();
  }

  stub(stubRequestHandler: StubRequestHandler): StubRequestHandler {
    this.stubs.set(stubRequestHandler.assertion.toString(), stubRequestHandler);
    return stubRequestHandler;
  }

  removeStub(stubRequestHandler: StubRequestHandler): boolean {
    const assertionKey = stubRequestHandler.assertion.toString();
    if (assertionKey in this.stubs) {
      return this.stubs.delete(assertionKey);
    }
    return true;
  }

  install(): Stub {
    this.stubFetchInstance = stub(
      globalThis,
      "fetch",
      async (url: string | URL | Request, options?: RequestInit) => {
        const request = url instanceof Request
          ? url
          : new Request(url, options);

        for (const stubRequestHandler of this.stubs.values()) {
          try {
            // Clone the request for each assertion attempt to ensures the body can be read multiple times
            const requestClone = request.clone();
            const assertionResult = stubRequestHandler.assertion(requestClone);

            if (assertionResult instanceof Promise) {
              await assertionResult;
            }

            return Promise.resolve(stubRequestHandler.response);
          } catch (_error) {
            // do nothing
          }
        }

        throw new UnmatchedRequestError(request);
      },
    );

    return this.stubFetchInstance;
  }

  restore(): void {
    if (this.stubFetchInstance) {
      this.stubFetchInstance.restore();
      this.stubFetchInstance = null;
    }
  }
}
