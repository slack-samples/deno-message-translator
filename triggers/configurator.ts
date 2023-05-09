import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import workflowDef from "../workflows/configurator.ts";

/**
 * A link trigger to start the configurator interactions.
 * If you want to limit people who can configure the translator app,
 * sharing this link URL in a private channel would be recommended.
 */
const trigger: Trigger<typeof workflowDef.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Configurator for DeepL Translator",
  workflow: `#/workflows/${workflowDef.definition.callback_id}`,
  inputs: {
    interactivity: { value: TriggerContextData.Shortcut.interactivity },
  },
};

export default trigger;
