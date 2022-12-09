import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import {
  createOrUpdateTrigger,
  findTriggerToUpdate,
  joinAllChannels,
} from "./internals/trigger-operations.ts";

export const def = DefineFunction({
  callback_id: "configure",
  title: "Manage a reaction_added event trigger",
  source_file: "functions/configure.ts",
  input_parameters: {
    properties: {
      interactivityPointer: { type: Schema.types.string },
      reacjilatorWorkflowCallbackId: { type: Schema.types.string },
    },
    required: ["interactivityPointer", "reacjilatorWorkflowCallbackId"],
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
  // ---------------------------
  // Open a modal for configuring the channel list
  // ---------------------------
  const client = SlackAPI(token);
  const triggerToUpdate = await findTriggerToUpdate(
    client,
    inputs.reacjilatorWorkflowCallbackId,
  );
  console.log(`triggerToUpdate: ${JSON.stringify(triggerToUpdate)}`);

  const channelIds = triggerToUpdate?.channel_ids != undefined
    ? triggerToUpdate.channel_ids
    : [];

  // Open the modal to configure the channel list to enable this workflow
  await client.views.open({
    interactivity_pointer: inputs.interactivityPointer,
    view: buildModalView(channelIds),
  });
  return {
    // Set this to continue the interaction with this user
    completed: false,
  };
})
  // ---------------------------
  // view_submission handler
  // ---------------------------
  .addViewSubmissionHandler(
    ["configure-workflow"],
    async ({ view, inputs, token }) => {
      const { reacjilatorWorkflowCallbackId } = inputs;
      const channelIds = view.state.values.block.channels.selected_channels;

      const client = SlackAPI(token);
      let modalMessage =
        "*You're all set!*\n\nThis translator is now available for the channels :white_check_mark:";
      try {
        const triggerToUpdate = await findTriggerToUpdate(
          client,
          inputs.reacjilatorWorkflowCallbackId,
        );
        // If the trigger already exists, we update it.
        // Otherwise, we create a new one.
        await createOrUpdateTrigger(
          client,
          reacjilatorWorkflowCallbackId,
          channelIds,
          triggerToUpdate,
        );
        // This app's bot user joins all the channels
        // to perform API calls for the channels
        const error = await joinAllChannels(
          client,
          channelIds,
        );
        if (error) {
          modalMessage = error;
        }
      } catch (e) {
        console.log(e);
        modalMessage = e;
      }
      // nothing to return if you want to close this modal
      return buildModalUpdateResponse(modalMessage);
    },
  )
  // ---------------------------
  // view_closed handler
  // ---------------------------
  .addViewClosedHandler(
    ["configure-workflow"],
    ({ view }) => {
      console.log(`view_closed handler called: ${JSON.stringify(view)}`);
      return {
        outputs: {},
        completed: true,
      };
    },
  );

// ---------------------------
// Internal functions
// ---------------------------

function buildModalView(channelIds: string[]) {
  return {
    "type": "modal",
    "callback_id": "configure-workflow",
    "title": {
      "type": "plain_text",
      "text": "DeepL Translator",
    },
    "notify_on_close": true,
    "submit": {
      "type": "plain_text",
      "text": "Confirm",
    },
    "blocks": [
      {
        "type": "input",
        "block_id": "block",
        "element": {
          "type": "multi_channels_select",
          "placeholder": {
            "type": "plain_text",
            "text": "Select channels to add",
          },
          "initial_channels": channelIds,
          "action_id": "channels",
        },
        "label": {
          "type": "plain_text",
          "text": "Channels to enable translator",
        },
      },
    ],
  };
}

function buildModalUpdateResponse(modalMessage: string) {
  return {
    response_action: "update",
    view: {
      "type": "modal",
      "callback_id": "configure-workflow",
      "notify_on_close": true,
      "title": {
        "type": "plain_text",
        "text": "DeepL Translator",
      },
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": modalMessage,
          },
        },
      ],
    },
  };
}
