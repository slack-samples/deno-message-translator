# Message Translator (powered by DeepL API)

The sample features a message translation automation. The app is added to
designated channels by running a configurator workflow. Once added to specific
channels, the app will translate any message there when a user adds a reaction
to the message (ex: 🇺🇸, 🇪🇸, 🇫🇷, 🇯🇵, and more)!

To learn the full list of the supported languages, head to
[the DeepL API's document site](https://www.deepl.com/en/docs-api).

**Guide Outline**:

- [Included Workflows](#included-workflows)
- [Setup](#setup)
  - [Install the Slack CLI](#install-the-slack-cli)
  - [Clone the Template](#clone-the-template)
  - [Create DeepL API Account](#create-deepl-api-account)
- [Creating Triggers](#creating-triggers)
- [Datastores](#datastores)
- [Testing](#testing)
- [Deploying Your App](#deploying-your-app)
- [Viewing Activity Logs](#viewing-activity-logs)
- [Project Structure](#project-structure)
- [Resources](#resources)

---

## Included Workflows

- **Configurator:** Configure which channels the app can translate messages in.
  If added to a private channel, please note that you may need to manually add
  the app to that channel in order for it to work.
- **Reacjilator:** Runs when a user reacts to a message in a channel where the
  app is added. If the reaction is a supported flag emoji (ex: 🇺🇸, 🇪🇸, 🇫🇷, 🇯🇵),
  then the app will respond in the message thread with a translated message in a
  language corresponding to the flag a user reacted with.
- **Maintenance job:** Runs daily to add the app back to channels where users
  have manually removed the app. Recommended for production-grade operations.

## Setup

Before getting started, first make sure you have a development workspace where
you have permission to install apps. **Please note that the features in this
project require that the workspace be part of
[a Slack paid plan](https://slack.com/pricing).**

### Install the Slack CLI

To use this sample, you need to install and configure the Slack CLI.
Step-by-step instructions can be found in our
[Quickstart Guide](https://api.slack.com/automation/quickstart).

### Clone the Sample

Start by cloning this repository:

```zsh
# Clone this project onto your machine
$ slack create my-app -t slack-samples/deno-message-translator

# Change into the project directory
$ cd my-app
```

### Create DeepL API Account

This sample requires a valid DeepL API access token for text translation. Head
to [the DeepL API site](https://www.deepl.com/en/docs-api) and create
[your own API account](https://www.deepl.com/account/summary).

**Please note that API accounts are different from DeepL's regular accounts**.
Even when you already have an account for using the text translation on the
website, a separate account for API access needs to be created.

Once you create your API account, copy the API token string on
[the account summary page](https://www.deepl.com/account/summary), which is used
for the next section.

#### Development Environment Variables

When [developing locally](https://api.slack.com/automation/run), environment
variables found in the `.env` file at the root of your project are used. For
local development, rename `.env.sample` to `.env` and add your access token to
the file contents (replacing `ACCESS_TOKEN` with your token):

```bash
# .env
DEEPL_AUTH_KEY=ACCESS_TOKEN
```

#### Production Environment Variables

[Deployed apps](https://api.slack.com/automation/deploy) use environment
variables that are added using `slack env`. To add your access token to a
Workspace where your deployed app is installed, use the following command (once
again, replacing `ACCESS_TOKEN` with your token):

```zsh
$ slack env add DEEPL_AUTH_KEY YOUR_ACCESS_TOKEN
```

## Running Your Project Locally

While building your app, you can see your changes appear in your workspace in
real-time with `slack run`. You'll know an app is the development version if the
name has the string `(local)` appended.

```zsh
# Run app locally
$ slack run

Connected, awaiting events
```

To stop running locally, press `<CTRL> + C` to end the process.

## Creating Triggers

[Triggers](https://api.slack.com/automation/triggers) are what cause workflows
to run. These triggers can be invoked by a user, or automatically as a response
to an event within Slack.

When you `run` or `deploy` your project for the first time, the CLI will prompt
you to create a trigger if one is found in the `triggers/` directory. For any
subsequent triggers added to the application, each must be
[manually added using the `trigger create` command](#manual-trigger-creation).

When creating triggers, you must select the workspace and environment that you'd
like to create the trigger in. Each workspace can have a local development
version (denoted by `(local)`), as well as a deployed version. _Triggers created
in a local environment will only be available to use when running the
application locally._

### Link Triggers

A [link trigger](https://api.slack.com/automation/triggers/link) is a type of
trigger that generates a **Shortcut URL** which, when posted in a channel or
added as a bookmark, becomes a link. When clicked, the link trigger will run the
associated workflow.

Link triggers are _unique to each installed version of your app_. This means
that Shortcut URLs will be different across each workspace, as well as between
[locally run](#running-your-project-locally) and
[deployed apps](#deploying-your-app).

With link triggers, after selecting a workspace and environment, the output
provided will include a Shortcut URL. Copy and paste this URL into a channel as
a message, or add it as a bookmark in a channel of the workspace you selected.
Interacting with this link will run the associated workflow.

**Note: triggers won't run the workflow unless the app is either running locally
or deployed!**

### Manual Trigger Creation

To manually create a trigger, use the following command:

```zsh
$ slack trigger create --trigger-def triggers/configurator.ts
```

### Usage

<img src="https://user-images.githubusercontent.com/19658/206636945-e6078c32-0e81-422b-bb38-711d10f53b55.gif" width=500 />

Once the translator is added to a channel, adding reactions such as `:jp:` and
`:fr:` results in posting translation results of the target message as replies
in its thread.

<img width="600" src="https://user-images.githubusercontent.com/19658/206638194-6eff88fa-05c1-4308-a180-0a547890aab6.png">

## Datastores

For storing data related to your app, datastores offer secure storage on Slack
infrastructure. The use of a datastore requires the
`datastore:write`/`datastore:read` scopes to be present in your manifest.

## Testing

For an example of how to test a function, see `functions/translate_test.ts`.
Test filenames should be suffixed with `_test`.

Run all tests with `deno test`:

```zsh
$ deno test
```

## Deploying Your App

Once development is complete, deploy the app to Slack infrastructure using
`slack deploy`:

```zsh
$ slack deploy
```

When deploying for the first time, you'll be prompted to
[create a new link trigger](#creating-triggers) for the deployed version of your
app. When that trigger is invoked, the workflow should run just as it did when
developing locally (but without requiring your server to be running).

### Production Maintenance Job

For production, we recommend enabling the included `maintenance_job.ts`
workflow.

The app's bot user must be a member of a channel in order to listen for events
there. When you add a new channel in the configuration modal, the bot user
automatically joins the channel. **However, anyone can remove the bot user from
the channel at any time.**

To enable a job that will re-add the bot user to channel, run the following
command that generates a scheduled trigger to run daily:

```zsh
$ slack trigger create --trigger-def triggers/daily_maintenance_job.ts
```

## Viewing Activity Logs

Activity logs of your application can be viewed live and as they occur with the
following command:

```zsh
$ slack activity --tail
```

## Project Structure

### `.slack/`

Contains `apps.dev.json` and `apps.json`, which include installation details for
development and deployed apps.

### `datastores/`

[Datastores](https://api.slack.com/automation/datastores) securely store data
for your application on Slack infrastructure. Required scopes to use datastores
include `datastore:write` and `datastore:read`.

### `functions/`

[Functions](https://api.slack.com/automation/functions) are reusable building
blocks of automation that accept inputs, perform calculations, and provide
outputs. Functions can be used independently or as steps in workflows.

### `triggers/`

[Triggers](https://api.slack.com/automation/triggers) determine when workflows
are run. A trigger file describes the scenario in which a workflow should be
run, such as a user pressing a button or when a specific event occurs.

### `workflows/`

A [workflow](https://api.slack.com/automation/workflows) is a set of steps
(functions) that are executed in order.

Workflows can be configured to run without user input or they can collect input
by beginning with a [form](https://api.slack.com/automation/forms) before
continuing to the next step.

### `manifest.ts`

The [app manifest](https://api.slack.com/automation/manifest) contains the app's
configuration. This file defines attributes like app name and description.

### `slack.json`

Used by the CLI to interact with the project's SDK dependencies. It contains
script hooks that are executed by the CLI and implemented by the SDK.

## Resources

To learn more about developing automations on Slack, visit the following:

- [Automation Overview](https://api.slack.com/automation)
- [CLI Quick Reference](https://api.slack.com/automation/cli/quick-reference)
- [Samples and Templates](https://api.slack.com/automation/samples)
