import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { SlackAPIClient } from "deno-slack-api/types.ts";

export const def = DefineFunction({
  callback_id: "translate",
  title: "Post the translation of given message as a reply in its thread",
  source_file: "functions/translate.ts",
  input_parameters: {
    properties: {
      channelId: { type: Schema.types.string },
      messageTs: { type: Schema.types.string },
      lang: { type: Schema.types.string },
    },
    required: ["channelId", "messageTs"],
  },
  output_parameters: {
    properties: { ts: { type: Schema.types.string } },
    required: [],
  },
});

export default SlackFunction(def, async ({
  inputs,
  token,
  env,
}) => {
  console.log(`translate inputs: ${JSON.stringify(inputs)}`);
  const emptyOutputs = { outputs: {} };
  if (inputs.lang === undefined) {
    // no language specified by the reaction
    console.log("Skipped as no lang detected");
    return emptyOutputs;
  }
  const client: SlackAPIClient = SlackAPI(token);
  const translationTarget = await client.conversations.history({
    channel: inputs.channelId,
    oldest: inputs.messageTs,
    limit: 1,
    inclusive: true,
  });
  console.log(JSON.stringify(translationTarget, null, 2));
  if (translationTarget.error) {
    // If you see this log message, perhaps you need to invite this app to the channel
    console.log(
      `Failed to fetch the message due to ${translationTarget.error}. Perhaps, you need to invite this app's bot user to the channel.`,
    );
    return emptyOutputs;
  }

  if (translationTarget.messages.length == 0) {
    console.log("No message found");
    return emptyOutputs;
  }

  const authKey = env.DEEPL_AUTH_KEY;
  if (!authKey) {
    const error =
      "DEEPL_AUTH_KEY needs to be set. You can place .env file for local dev. For production apps, please run `slack env add DEEPL_AUTH_KEY (your key here)` to set the value.";
    throw new Error(error);
  }
  const apiSubdomain = authKey.endsWith(":fx") ? "api-free" : "api";
  const url = `https://${apiSubdomain}.deepl.com/v2/translate`;
  const body = new URLSearchParams();
  body.append("auth_key", authKey);
  body.append("text", translationTarget.messages[0].text);
  body.append("target_lang", inputs.lang.toUpperCase());
  const deeplResponse = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body,
  });
  const translationResult = await deeplResponse.json();
  if (
    !translationResult ||
    !translationResult.translations ||
    translationResult.translations.length === 0
  ) {
    const error = `Translation failed for some reason: ${
      JSON.stringify(translationResult)
    }`;
    console.log(error);
    throw new Error(error);
  }
  const translatedText = translationResult.translations[0].text;
  const replies = await client.conversations.replies({
    channel: inputs.channelId,
    ts: inputs.messageTs,
  });
  if (isAlreadyPosted(replies.messages, translatedText)) {
    // Skip posting the same one
    console.log(
      `Skipped this translation as it's already posted: ${
        JSON.stringify(translatedText)
      }`,
    );
    // This is not an error
    return emptyOutputs;
  }
  const result = await sayInThread(
    client,
    inputs.channelId,
    inputs.messageTs,
    translatedText,
  );
  return { outputs: { ts: result.ts } };
});

// ---------------------------
// Internal functions
// ---------------------------

function isAlreadyPosted(
  // deno-lint-ignore no-explicit-any
  replies: Record<string, any>[],
  translatedText: string,
): boolean {
  if (!replies) {
    return false;
  }
  for (const messageInThread of replies) {
    if (messageInThread.text && messageInThread.text === translatedText) {
      return true;
    }
  }
  return false;
}

async function sayInThread(
  client: SlackAPIClient,
  channelId: string,
  threadTs: string,
  text: string,
) {
  return await client.chat.postMessage({
    channel: channelId,
    text,
    thread_ts: threadTs,
  });
}
