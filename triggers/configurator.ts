import { Trigger } from "deno-slack-api/types.ts";
import workflowDef from "../workflows/configurator.ts";

/**
 * A link trigger to start the configurator interactions.
 * If you want to limit people who can configure the translator app,
 * sharing this link URL in a private channel would be recommended.
 */
const trigger: Trigger<typeof workflowDef.definition> = {
  type: "shortcut",
  name: "Configurator for DeepL Translator",
  workflow: `#/workflows/${workflowDef.definition.callback_id}`,
  inputs: { interactivity: { value: "{{data.interactivity}}" } },
};

export default trigger;
