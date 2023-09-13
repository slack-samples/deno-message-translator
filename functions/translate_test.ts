import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "std/testing/asserts.ts";
import handler from "./translate.ts";

// Replaces globalThis.fetch with the mocked copy
mf.install();

mf.mock("POST@/api/conversations.replies", (args) => {
  const authHeader = args.headers.get("Authorization");
  if (authHeader === "Bearer empty-response") {
    return new Response(JSON.stringify({ ok: true, messages: [] }), {
      status: 200,
    });
  }
  return new Response(
    JSON.stringify({
      "ok": true,
      "oldest": "1670566778.964519",
      "messages": [
        {
          "type": "message",
          "text":
            "Make work life simpler, more pleasant and more productive.\n\nSlack is the collaboration hub that brings the right people, information, and tools together to get work done. From Fortune 100 companies to corner markets, millions of people around the world use Slack to connect their teams, unify their systems, and drive their business forward.",
          "user": "U03E94MK0",
          "ts": "1670566778.964519",
          "team": "T03E94MJU",
          "thread_ts": "1670566778.964519",
          "reply_count": 3,
          "reply_users_count": 1,
          "latest_reply": "1670570301.090889",
          "reply_users": ["U04EJMQQEFN"],
          "is_locked": false,
          "subscribed": false,
          "reactions": [{ "name": "jp", "users": ["U03E94MK0"], "count": 1 }],
        },
      ],
      "has_more": false,
      "pin_count": 0,
      "channel_actions_ts": null,
      "channel_actions_count": 0,
    }),
    {
      status: 200,
    },
  );
});

mf.mock("POST@/api/chat.postMessage", () => {
  return new Response(JSON.stringify({ ok: true, ts: "1111.2222" }), {
    status: 200,
  });
});

mf.mock("POST@/v2/translate", async (args) => {
  const body = await args.formData();
  if (body.get("auth_key") !== "valid") {
    return new Response("", { status: 403 });
  }
  return new Response(
    JSON.stringify({
      translations: [
        {
          detected_source_language: "EN",
          text:
            "ワークライフをよりシンプルに、より快適に、より生産的にする。\n\nSlack は、適切な人、情報、ツールを集めて仕事を成し遂げるためのコラボレーション ハブです。フォーチュン100の企業から片隅の市場ま...",
        },
      ],
    }),
    {
      status: 200,
    },
  );
});

const { createContext } = SlackFunctionTester("my-function");

Deno.test("No message found", async () => {
  const inputs = {
    channelId: "C111",
    messageTs: "1670566778.964519",
    lang: "ja",
  };
  const env = { DEEPL_AUTH_KEY: "valid", DEBUG_MODE: "false" };
  const token = "empty-response";
  const { outputs } = await handler(createContext({ inputs, env, token }));
  assertEquals(outputs, {});
});

Deno.test("Translate a message successfully", async () => {
  const inputs = {
    channelId: "C123",
    messageTs: "1670566778.964519",
    lang: "ja",
  };
  const env = { DEEPL_AUTH_KEY: "valid", DEBUG_MODE: "false" };
  const token = "valid";
  const { outputs } = await handler(createContext({ inputs, env, token }));
  assertEquals(outputs, { ts: "1111.2222" });
});

Deno.test("Fail to translate with an invalid auth key", async () => {
  const inputs = {
    channelId: "C111",
    messageTs: "1670566778.964519",
    lang: "ja",
  };
  const env = { DEEPL_AUTH_KEY: "invalid", DEBUG_MODE: "false" };
  const token = "valid";
  const { outputs, error } = await handler(
    createContext({ inputs, env, token }),
  );
  assertEquals(outputs, undefined);
  assertEquals(
    error,
    "Translating a message failed! Please make sure if the DEEPL_AUTH_KEY is correct. - (status: 403, target text: Make work life simpler, more p...)",
  );
});
