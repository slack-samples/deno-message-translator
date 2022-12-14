import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "std/testing/asserts.ts";
import handler from "./detect_lang.ts";

const { createContext } = SlackFunctionTester("my-function");

Deno.test("Detect the language when a country name is given", async () => {
  const inputs = { reaction: "jp" };
  const env = { DEBUG_MODE: "false" };
  const { outputs } = await handler(createContext({ inputs, env }));
  assertEquals(outputs?.lang, "ja");
});

Deno.test("Detect the language when a flag is given", async () => {
  const inputs = { reaction: "flag-au" };
  const env = { DEBUG_MODE: "false" };
  const { outputs } = await handler(createContext({ inputs, env }));
  assertEquals(outputs?.lang, "en");
});

Deno.test("Return nothing when the given reaction is irrelevant", async () => {
  const inputs = { reaction: "eyes" };
  const env = { DEBUG_MODE: "false" };
  const { outputs } = await handler(createContext({ inputs, env }));
  assertEquals(outputs?.lang, undefined);
});
