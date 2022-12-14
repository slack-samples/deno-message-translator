import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "std/testing/asserts.ts";
import handler from "./configure.ts";

// Replaces globalThis.fetch with the mocked copy
mf.install();

mf.mock("POST@/api/workflows.triggers.list", () => {
  return new Response(
    JSON.stringify({
      "ok": true,
      "triggers": [
        {
          "id": "Ft04EJSBG0LC",
          "inputs": {
            "reaction": { "value": "{{data.reaction}}" },
            "channelId": { "value": "{{data.channel_id}}" },
            "messageTs": { "value": "{{data.message_ts}}" },
          },
          "outputs": {},
          "available_data": {},
          "date_created": 1670568937,
          "date_updated": 1670568937,
          "type": "event",
          "event_type": "slack#/events/reaction_added",
          "name": "reaction_added event trigger",
          "description": "",
          "channel_ids": [
            "C03E94MKS",
            "C03E94MKU",
            "CLT1F93TP",
          ],
          "workflow": {
            "id": "Fn04E9L124J2",
            "callback_id": "reacjilator",
            "title": "DeepL translation",
            "description": "",
            "type": "workflow",
            "input_parameters": [
              {
                "type": "slack#/types/channel_id",
                "name": "channelId",
                "title": "Channel Id",
                "is_required": true,
              },
              {
                "type": "string",
                "name": "messageTs",
                "title": "Message Ts",
                "is_required": true,
              },
              {
                "type": "string",
                "name": "reaction",
                "title": "Reaction",
                "is_required": true,
              },
            ],
            "output_parameters": [],
            "app_id": "A111111",
            "app": {
              "id": "A111111",
              "name": "DeepL Translator (dev)",
              "icons": {},
              "is_workflow_app": false,
            },
            "date_created": 1670565692,
            "date_updated": 1670569292,
            "date_deleted": 0,
            "workflow_id": "Wf04E1MNNXDM",
          },
        },
      ],
      "response_metadata": {
        "next_cursor": "",
      },
    }),
    {
      status: 200,
    },
  );
});

mf.mock("POST@/api/views.open", (args) => {
  const authHeader = args.headers.get("Authorization");
  if (authHeader !== "Bearer valid") {
    return new Response(
      JSON.stringify({ "ok": false, "error": "invalid_auth" }),
      {
        status: 200,
      },
    );
  }
  return new Response(JSON.stringify({ "ok": true, "view": {} }), {
    status: 200,
  });
});

const { createContext } = SlackFunctionTester("my-function");

Deno.test("Open a modal successfully", async () => {
  const inputs = {
    interactivityPointer: "the-pointer",
    reacjilatorWorkflowCallbackId: "reacjilator",
  };
  const token = "valid";
  const env = { DEBUG_MODE: "false" };
  const { outputs } = await handler(createContext({ inputs, token, env }));
  assertEquals(outputs, undefined);
});

Deno.test("Fail to open a modal with an invalid token", async () => {
  const inputs = {
    interactivityPointer: "the-pointer",
    reacjilatorWorkflowCallbackId: "reacjilator",
  };
  const token = "invalid";
  const env = { DEBUG_MODE: "false" };
  const { outputs, error } = await handler(
    createContext({ inputs, token, env }),
  );
  assertEquals(outputs, undefined);
  assertEquals(
    error,
    "Failed to open a modal in the configurator workflow. Contact the app maintainers with the following information - (error: invalid_auth)",
  );
});
