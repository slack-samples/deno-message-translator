import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import {
  findTriggerToUpdate,
  joinAllChannels,
} from "./internals/trigger-operations.ts";

export const def = DefineFunction({
  callback_id: "maintain-membership",
  title: "Maintain channel memberships for a trigger",
  source_file: "functions/maintain_membership.ts",
  input_parameters: {
    properties: {
      reacjilatorWorkflowCallbackId: { type: Schema.types.string },
    },
    required: ["reacjilatorWorkflowCallbackId"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(def, async ({
  inputs,
  token,
}) => {
  const client = SlackAPI(token);
  const targetTrigger = await findTriggerToUpdate(
    client,
    inputs.reacjilatorWorkflowCallbackId,
  );
  if (
    targetTrigger === undefined ||
    targetTrigger.channel_ids === undefined
  ) {
    // The "reaction_added" event trigger does not exist yet
    return { outputs: {} };
  }

  // This app's bot user joins all the channels
  // to perform API calls for the channels
  const error = await joinAllChannels(
    client,
    targetTrigger.channel_ids,
  );
  if (error) {
    return { error };
  } else {
    return { outputs: {} };
  }
});
