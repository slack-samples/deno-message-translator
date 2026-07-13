import { SlackFunctionTester } from "@slack/sdk";
import { assertEquals } from "@std/assert";
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
