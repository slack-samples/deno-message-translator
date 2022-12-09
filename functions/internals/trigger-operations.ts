import { SlackAPIClient } from "deno-slack-api/types.ts";

export async function findTriggerToUpdate(
  client: SlackAPIClient,
  workflowCallbackId: string,
) {
  // Check the existing triggers for this workflow
  const allTriggers = await client.workflows.triggers.list({});
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
  console.log(`triggerToUpdate: ${JSON.stringify(triggerToUpdate)}`);
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
    console.log(`A new trigger updated: ${JSON.stringify(update)}`);
  }
}

export async function joinAllChannels(
  client: SlackAPIClient,
  channelIds: string[],
) {
  for (const channelId of channelIds) {
    const response = await client.conversations.join({
      channel: channelId,
    });
    console.log(`conversations.join API result: ${JSON.stringify(response)}`);
    if (response.error) {
      const error = `Failed to join <#${channelId}> due to ${response.error}`;
      console.log(error);
      return error;
    }
  }
}
