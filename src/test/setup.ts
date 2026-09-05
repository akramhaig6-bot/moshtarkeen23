import "@testing-library/jest-dom";

// stub لـ ResizeObserver (يستخدمه recharts في بيئة jsdom)
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(global, "ResizeObserver", { writable: true, value: ResizeObserverStub });
Object.defineProperty(window, "ResizeObserver", { writable: true, value: ResizeObserverStub });

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
