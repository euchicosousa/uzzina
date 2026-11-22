import { expect, it } from "bun:test";
import {
  createPreferencePersistence,
  type PreferencePatch,
  type PreferenceRecord,
} from "../app/lib/preference-persistence";
const debounce = () => new Promise((resolve) => setTimeout(resolve, 280));
function setup() {
  let current = true;
  let state: PreferenceRecord = {};
  let errors = 0;
  const requests: {
    patch: PreferencePatch;
    resolve: (value: PreferenceRecord) => void;
    reject: (error: Error) => void;
  }[] = [];
  const controller = createPreferencePersistence({
    initial: { futureKey: "preserve", theme: "light", themeColor: "default" },
    save: (patch) =>
      new Promise<PreferenceRecord>((resolve, reject) => {
        requests.push({ patch, resolve, reject });
      }),
    isCurrent: () => current,
    onChange: (value) => {
      state = value;
    },
    onSaved: () => {},
    onError: () => {
      errors++;
    },
  });
  return {
    controller,
    requests,
    state: () => state,
    errors: () => errors,
    invalidate: () => {
      current = false;
    },
  };
}
it("production controller previews immediately and serializes theme+palette with server confirmation", async () => {
  const test = setup();
  test.controller.queue({ theme: "dark" });
  expect(test.state().theme).toBe("dark");
  await debounce();
  test.controller.queue({ themeColor: "red" });
  await debounce();
  expect(test.requests.length).toBe(1);
  test.requests[0]?.resolve({
    theme: "dark",
    themeColor: "default",
    futureKey: "preserve",
  });
  await Promise.resolve();
  expect(test.requests[1]?.patch).toEqual({ themeColor: "red" });
  expect(test.state().themeColor).toBe("red");
  test.requests[1]?.resolve({
    theme: "dark",
    themeColor: "red",
    futureKey: "preserve",
  });
  await Promise.resolve();
  expect(test.state()).toEqual({
    theme: "dark",
    themeColor: "red",
    futureKey: "preserve",
  });
  test.controller.dispose();
});
it("failed write retains newer same-field choice and requires explicit retry", async () => {
  const test = setup();
  test.controller.queue({ themeColor: "carbon" });
  await debounce();
  test.controller.queue({ themeColor: "orange", showInstagramSidebar: false });
  test.requests[0]?.reject(new Error("Offline"));
  await Promise.resolve();
  expect(test.errors()).toBe(1);
  expect(test.state().themeColor).toBe("orange");
  await debounce();
  expect(test.requests.length).toBe(1);
  test.controller.retry();
  expect(test.requests[1]?.patch).toEqual({
    themeColor: "orange",
    showInstagramSidebar: false,
  });
  test.requests[1]?.resolve({
    themeColor: "orange",
    showInstagramSidebar: false,
    futureKey: "preserve",
  });
  await Promise.resolve();
  test.controller.dispose();
});
it("debounce sends only the latest choice", async () => {
  const test = setup();
  test.controller.queue({ themeColor: "carbon" });
  test.controller.queue({ themeColor: "yellow" });
  await debounce();
  expect(test.requests.map((r) => r.patch)).toEqual([{ themeColor: "yellow" }]);
  test.controller.dispose();
});
it("unmount cancels pending timer", async () => {
  const test = setup();
  test.controller.queue({ theme: "dark" });
  test.controller.dispose();
  await debounce();
  expect(test.requests.length).toBe(0);
});
it("identity change prevents queued writes and old in-flight callbacks", async () => {
  const test = setup();
  test.controller.queue({ theme: "dark" });
  await debounce();
  test.controller.queue({ themeColor: "red" });
  const previous = test.state();
  test.invalidate();
  test.requests[0]?.resolve({ theme: "dark", themeColor: "default" });
  await debounce();
  expect(test.state()).toBe(previous);
  expect(test.requests.length).toBe(1);
  test.controller.dispose();
});
it("disposed controller cannot affect a newly mounted owner", async () => {
  const old = setup();
  old.controller.queue({ theme: "dark" });
  await debounce();
  old.controller.dispose();
  const next = setup();
  next.controller.queue({ themeColor: "yellow" });
  old.requests[0]?.reject(new Error("Late failure"));
  await debounce();
  expect(old.errors()).toBe(0);
  expect(next.requests[0]?.patch).toEqual({ themeColor: "yellow" });
  next.controller.dispose();
});
