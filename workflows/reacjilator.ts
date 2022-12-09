import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { def as detectLang } from "../functions/detect_lang.ts";
import { def as translate } from "../functions/translate.ts";

/**
 * A workflow that translates channel text messages into a different language.
 * End-users can add a reaction such a :jp: to translate any messages.
 * The translation result will be posted as a reply in the original message's thread.
 */
const workflow = DefineWorkflow({
  callback_id: "reacjilator",
  title: "DeepL translation",
  input_parameters: {
    properties: {
      channelId: { type: Schema.slack.types.channel_id },
      messageTs: { type: Schema.types.string },
      reaction: { type: Schema.types.string },
    },
    required: ["channelId", "messageTs", "reaction"],
  },
});

// Detect the language to translate into
const langDetection = workflow.addStep(detectLang, workflow.inputs);

// Call DeepL's text translation API and then post the result in the same thread
workflow.addStep(translate, {
  ...workflow.inputs,
  lang: langDetection.outputs.lang,
});

export default workflow;
