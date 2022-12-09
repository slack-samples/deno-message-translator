import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import handler from "./maintain_membership.ts";

// Replaces globalThis.fetch with the mocked copy
mf.install();

mf.mock("POST@/api/workflows.triggers.list", () => {
  return new Response(JSON.stringify(workflowsTriggersListResponse), {
    status: 200,
  });
});

mf.mock("POST@/api/conversations.join", () => {
  return new Response(JSON.stringify(JSON.stringify({ ok: true })), {
    status: 200,
  });
});

const { createContext } = SlackFunctionTester("my-function");

Deno.test("Join the channels", async () => {
  const inputs = { reacjilatorWorkflowCallbackId: "reacjilator" };
  const { outputs } = await handler(createContext({ inputs }));
  assertEquals(outputs, {});
});

const workflowsTriggersListResponse = {
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
};
