import { SlackAPIClient } from "deno-slack-sdk/types.ts";

export async function findTriggerToUpdate(
  client: SlackAPIClient,
  workflowCallbackId: string,
  debugMode: boolean,
) {
  // Check the existing triggers for this workflow
  const allTriggers = await client.workflows.triggers.list({ is_owner: true });
  let triggerToUpdate = undefined;

  // find the trigger to update
  if (allTriggers.triggers) {
    for (const trigger of allTriggers.triggers) {
      if (
        trigger.workflow.callback_id === workflowCallbackId &&
        trigger.event_type === "slack#/events/reaction_added"
      ) {
        triggerToUpdate = trigger;
      }
    }
  }
  if (debugMode) {
    console.log(`The trigger to update: ${JSON.stringify(triggerToUpdate)}`);
  }
  return triggerToUpdate;
}

const triggerInputs = {
  channelId: { value: "{{data.channel_id}}" },
  messageTs: { value: "{{data.message_ts}}" },
  reaction: { value: "{{data.reaction}}" },
};

export async function createOrUpdateTrigger(
  client: SlackAPIClient,
  workflowCallbackId: string,
  channelIds: string[],
  triggerToUpdate?: Record<string, string>,
) {
  // deno-lint-ignore no-explicit-any
  const channel_ids = channelIds as any;

  if (triggerToUpdate === undefined) {
    // Create a new trigger
    const creation = await client.workflows.triggers.create({
      type: "event",
      name: "reaction_added event trigger",
      workflow: `#/workflows/${workflowCallbackId}`,
      event: {
        event_type: "slack#/events/reaction_added",
        channel_ids,
      },
      inputs: triggerInputs,
    });
    if (creation.error) {
      throw new Error(
        `Failed to create a trigger! (response: ${JSON.stringify(creation)})`,
      );
    }
    console.log(`A new trigger created: ${JSON.stringify(creation)}`);
  } else {
    // Update the existing trigger
    const update = await client.workflows.triggers.update({
      trigger_id: triggerToUpdate.id,
      type: "event",
      name: "reaction_added event trigger",
      workflow: `#/workflows/${workflowCallbackId}`,
      event: {
        event_type: "slack#/events/reaction_added",
        channel_ids,
      },
      inputs: triggerInputs,
    });
    if (update.error) {
      throw new Error(
        `Failed to update a trigger! (response: ${JSON.stringify(update)})`,
      );
    }
    console.log(`The trigger updated: ${JSON.stringify(update)}`);
  }
}

export async function joinAllChannels(
  client: SlackAPIClient,
  channelIds: string[],
  debugMode: boolean,
) {
  const futures = channelIds.map((c) => joinChannel(client, c, debugMode));
  const results = (await Promise.all(futures)).filter((r) => r !== undefined);
  if (results.length > 0) {
    return results[0];
  }
  return undefined;
}

async function joinChannel(
  client: SlackAPIClient,
  channelId: string,
  debugMode: boolean,
) {
  const response = await client.conversations.join({ channel: channelId });
  if (debugMode) {
    console.log(`conversations.join API result: ${JSON.stringify(response)}`);
  }
  if (response.error) {
    if (response.error === "method_not_supported_for_channel_type") {
      const convo = await client.conversations.info({ channel: channelId });
      if (debugMode) {
        console.log(
          `conversations.info API result with private channel: ${
            JSON.stringify(convo)
          }`,
        );
      }
      if (!convo.error) {
        return;
      }
    }
    const authTest = await client.auth.test({});
    if (debugMode) {
      console.log(`auth.test API result: ${JSON.stringify(authTest)}`);
    }
    const error =
      `*:warning: Failed to join <#${channelId}> due to "${response.error}" error!*\n\nThis workflow is unable to add <@${authTest.user_id}> to private channels and DMs. For those conversations, please invite the bot user in advance :bow:`;
    console.log(error);
    return error;
  }
}
