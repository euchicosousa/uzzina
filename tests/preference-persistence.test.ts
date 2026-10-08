import {expect, it} from "bun:test";
import {createPreferencePersistence, type PreferencePatch, type PreferenceRecord} from "../app/lib/preference-persistence";
const debounce = () => new Promise(resolve => setTimeout(resolve, 280));
function setup() {
  let current = true;
  let state: PreferenceRecord = {};
  let errors = 0;
  const requests: {patch: PreferencePatch; resolve: (value: PreferenceRecord) => void; reject: (error: Error) => void}[] = [];
  const controller = createPreferencePersistence({
    initial: {futureKey:"preserve", theme:"light", themeColorIndex:0},
    save: patch => new Promise<PreferenceRecord>((resolve, reject) => {requests.push({patch,resolve,reject});}),
    isCurrent: () => current,
    onChange: value => {state=value;}, onSaved: () => {}, onError: () => {errors++;},
  });
  return {controller, requests, state:()=>state, errors:()=>errors, invalidate:()=>{current=false;}};
}
it("production controller previews immediately and serializes theme+palette with server confirmation", async()=>{
  const test=setup();
  test.controller.queue({theme:"dark"});
  expect(test.state().theme).toBe("dark");
  await debounce();
  test.controller.queue({themeColorIndex:2});
  await debounce();
  expect(test.requests.length).toBe(1);
  test.requests[0]?.resolve({theme:"dark",themeColorIndex:0,futureKey:"preserve"});
  await Promise.resolve();
  expect(test.requests[1]?.patch).toEqual({themeColorIndex:2});
  expect(test.state().themeColorIndex).toBe(2);
  test.requests[1]?.resolve({theme:"dark",themeColorIndex:2,futureKey:"preserve"});
  await Promise.resolve();
  expect(test.state()).toEqual({theme:"dark",themeColorIndex:2,futureKey:"preserve"});
  test.controller.dispose();
});
it("failed write retains newer same-field choice and requires explicit retry",async()=>{
  const test=setup();test.controller.queue({themeColorIndex:1});await debounce();
  test.controller.queue({themeColorIndex:3,followPartnerColor:true});
  test.requests[0]?.reject(new Error("Offline"));await Promise.resolve();
  expect(test.errors()).toBe(1);expect(test.state().themeColorIndex).toBe(3);
  await debounce();expect(test.requests.length).toBe(1);
  test.controller.retry();
  expect(test.requests[1]?.patch).toEqual({themeColorIndex:3,followPartnerColor:true});
  test.requests[1]?.resolve({themeColorIndex:3,followPartnerColor:true,futureKey:"preserve"});
  await Promise.resolve();test.controller.dispose();
});
it("debounce sends only the latest choice",async()=>{
  const test=setup();test.controller.queue({themeColorIndex:1});test.controller.queue({themeColorIndex:4});
  await debounce();expect(test.requests.map(r=>r.patch)).toEqual([{themeColorIndex:4}]);test.controller.dispose();
});
it("unmount cancels pending timer",async()=>{
  const test=setup();test.controller.queue({theme:"dark"});test.controller.dispose();
  await debounce();expect(test.requests.length).toBe(0);
});
it("identity change prevents queued writes and old in-flight callbacks",async()=>{
  const test=setup();test.controller.queue({theme:"dark"});await debounce();
  test.controller.queue({themeColorIndex:2});const previous=test.state();
  test.invalidate();test.requests[0]?.resolve({theme:"dark",themeColorIndex:0});
  await debounce();expect(test.state()).toBe(previous);expect(test.requests.length).toBe(1);test.controller.dispose();
});
it("disposed controller cannot affect a newly mounted owner",async()=>{
  const old=setup();old.controller.queue({theme:"dark"});await debounce();old.controller.dispose();
  const next=setup();next.controller.queue({themeColorIndex:4});
  old.requests[0]?.reject(new Error("Late failure"));await debounce();
  expect(old.errors()).toBe(0);expect(next.requests[0]?.patch).toEqual({themeColorIndex:4});next.controller.dispose();
});
