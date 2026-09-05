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

// jsdom لا ينفّذ scrollTo — تنصيبه كـ no-op يمنع مقاطعة React للـ render
// (كان الخطأ يترك الـ fiber بنصف hooks فتظهر رسالة "Rendered fewer hooks")
window.scrollTo = () => {};
Element.prototype.scrollTo = () => {};

// jsdom لا ينفّذ canvas.getContext — qrcode.react يرمي خطأً داخل commitPhase
// فيُقاطع React الـ render وتظهر أخطاء لاحقة مثل "Rendered fewer hooks".
// تنصيبه كسطح بسيط يكفي لإسكات المسار.
if (typeof HTMLCanvasElement !== "undefined") {
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    writable: true,
    value: function getContext() {
      const noop = () => {};
      return {
        canvas: this,
        fillStyle: "#000",
        strokeStyle: "#000",
        font: "",
        textAlign: "left",
        textBaseline: "alphabetic",
        fillRect: noop,
        strokeRect: noop,
        clearRect: noop,
        beginPath: noop,
        closePath: noop,
        moveTo: noop,
        lineTo: noop,
        stroke: noop,
        fill: noop,
        arc: noop,
        rect: noop,
        save: noop,
        restore: noop,
        translate: noop,
        scale: noop,
        rotate: noop,
        drawImage: noop,
        putImageData: noop,
        fillText: noop,
        strokeText: noop,
        measureText: () => ({ width: 0 }),
        getImageData: () => ({ data: [] }),
        createLinearGradient: () => ({ addColorStop: noop }),
        createPattern: () => null,
      };
    },
  });
  Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
    configurable: true,
    writable: true,
    value: () => "data:image/png;base64,",
  });
}
