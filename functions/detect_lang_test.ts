import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import handler from "./detect_lang.ts";

const { createContext } = SlackFunctionTester("my-function");

Deno.test("Detect the language when a country name is given", async () => {
  const inputs = { reaction: "jp" };
  const { outputs } = await handler(createContext({ inputs }));
  assertEquals(outputs?.lang, "ja");
});

Deno.test("Detect the language when a flag is given", async () => {
  const inputs = { reaction: "flag-au" };
  const { outputs } = await handler(createContext({ inputs }));
  assertEquals(outputs?.lang, "en");
});

Deno.test("Return nothing when the given reaction is irrelevant", async () => {
  const inputs = { reaction: "eyes" };
  const { outputs } = await handler(createContext({ inputs }));
  assertEquals(outputs?.lang, undefined);
});
