import { JSDOM } from "jsdom";

if (typeof globalThis.window === "undefined") {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost:5173",
    pretendToBeVisual: true,
  });

  const { window } = dom;

  // Expose necessary global objects
  globalThis.window = window as unknown as Window & typeof globalThis;
  globalThis.document = window.document;
  globalThis.navigator = window.navigator;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.HTMLButtonElement = window.HTMLButtonElement;
  globalThis.HTMLInputElement = window.HTMLInputElement;
  globalThis.HTMLTextAreaElement = window.HTMLTextAreaElement;
  globalThis.HTMLSelectElement = window.HTMLSelectElement;
  globalThis.Element = window.Element;
  globalThis.SVGElement = window.SVGElement;
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);
  globalThis.Node = window.Node;
  globalThis.NodeFilter = window.NodeFilter;
  globalThis.Event = window.Event;
  globalThis.CustomEvent = window.CustomEvent;
  globalThis.FocusEvent = window.FocusEvent;
  globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
  globalThis.MutationObserver = window.MutationObserver;

  // React 18+ act environment flag
  // @ts-expect-error test act flag
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
}
