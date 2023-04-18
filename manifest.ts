import { Manifest } from "deno-slack-sdk/mod.ts";
import { def as detectLang } from "./functions/detect_lang.ts";
import { def as translate } from "./functions/translate.ts";
import { def as configure } from "./functions/configure.ts";
import { def as maintainMembership } from "./functions/maintain_membership.ts";
import reacjilator from "./workflows/reacjilator.ts";
import configurator from "./workflows/configurator.ts";
import maintenanceJob from "./workflows/maintenance_job.ts";

/**
 * DeepL Translator app translates Slack messages in channels.
 * During the open beta period, only public channels are supported.
 * To run this app, DeepL API account is required.
 * Refer to https://www.deepl.com/en/docs-api for DeepL API details.
 */
export default Manifest({
  name: "DeepL Translator",
  description: "A Slack app translates Slack messages",
  icon: "assets/default_new_app_icon.png",
  functions: [
    detectLang,
    translate,
    configure,
    maintainMembership,
  ],
  workflows: [
    reacjilator,
    configurator,
    maintenanceJob,
  ],
  outgoingDomains: [
    "api-free.deepl.com",
    "api.deepl.com",
  ],
  botScopes: [
    // reacjilator
    "commands",
    "chat:write",
    "channels:history",
    "reactions:read",
    "groups:history",
    // configurator
    "triggers:read",
    "triggers:write",
    "channels:join",
  ],
});
