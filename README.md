# Run-on-Slack Deno: Translator App (powered by DeepL API)

This app contains a sample TypeScript project for use on Slack's
[next-generation hosted platform](https://api.slack.com/future). The project
demonstrates how to run a simple message translator workflow in response to
national flag based reactions. Admins can configure where to run this app using
a link trigger based interactions to maintain the list of channels. Once the app
is added to a channel, end-users can translate any messages into a different
language just by adding a reaction such as 🇺🇸, 🇪🇸, 🇫🇷, 🇯🇵, and more! To learn
the full list of the supported languages, head to
[the DeepL API's document site](https://www.deepl.com/en/docs-api).

**Guide Outline**:

- [Setup](#setup)
  - [Create Your DeepL API Account](#create-your-deepl-api-account)
  - [Install the Slack CLI](#install-the-slack-cli)
  - [Clone the Template](#clone-the-template)
- [Create a Link Trigger](#create-a-link-trigger)
- [Running Your Project Locally](#running-your-project-locally)
- [Testing](#testing)
- [Deploying Your App](#deploying-your-app)
  - [Viewing Activity Logs](#viewing-activity-logs)
- [Project Structure](#project-structure)
- [Resources](#resources)

---

## Setup

Before getting started, make sure you have a development workspace where you
have permissions to install apps. If you don’t have one set up, go ahead and
[create one](https://slack.com/create). Also, please note that the workspace
requires any of [the Slack paid plans](https://slack.com/pricing).

### Create Your DeepL API Account

Also, this app needs a valid DeepL API access token for text translation API
calls. Head to
[the DeepL API's document site](https://www.deepl.com/en/docs-api) and create
[your own API account](https://www.deepl.com/account/summary).

Copy [the token string](https://www.deepl.com/account/summary) and save the
value in `.env` file:

```
DEEPL_AUTH_KEY=(your token here)
```

When you deploy your app, you can set the same value by running the following
command:

```bash
slack env add DEEPL_AUTH_KEY (you token here)
```

### Install the Slack CLI

To use this template, you first need to install and configure the Slack CLI.
Step-by-step instructions can be found in our
[Quickstart Guide](https://api.slack.com/future/quickstart).

### Clone the Template

Start by cloning this repository:

```zsh
# Clone this project onto your machine
$ slack create my-deepl-translator -t slack-samples/deno-deepl-translator

# Change into this project directory
$ cd my-deepl-translator
```

## Create a Link Trigger for configuring your app

[Triggers](https://api.slack.com/future/triggers) are what cause Workflows to
run. These Triggers can be invoked by a user, or automatically as a response to
an event within Slack.

A [Link Trigger](https://api.slack.com/future/triggers/link) is a type of
Trigger that generates a **Shortcut URL** which, when posted in a channel or
added as a bookmark, becomes a link. When clicked, the Link Trigger will run the
associated Workflow.

Link Triggers are _unique to each installed version of your app_. This means
that Shortcut URLs will be different across each workspace, as well as between
[locally run](#running-your-project-locally) and
[deployed apps](#deploying-your-app). When creating a Trigger, you must select
the Workspace that you'd like to create the Trigger in. Each Workspace has a
development version (denoted by `(dev)`), as well as a deployed version.

To create a Link Trigger for the Workflow in this template, run the following
command:

```zsh
$ slack trigger create --trigger-def triggers/configurator.ts
```

After selecting a Workspace, the output provided will include the Link Trigger
Shortcut URL. Copy and paste this URL into a channel as a message, or add it as
a bookmark in a channel of the Workspace you selected.

**Note: this link won't run the Workflow until the app is either running locally
or deployed!** Read on to learn how to run your app locally and eventually
deploy it to Slack hosting.

## Running Your Project Locally

While building your app, you can see your changes propagated to your workspace
in real-time with `slack run`. In both the CLI and in Slack, you'll know an app
is the development version if the name has the string `(dev)` appended.

```zsh
# Run app locally
$ slack run

Connected, awaiting events
```

Once running, click the
[previously created Shortcut URL](#create-a-link-trigger) associated with the
`(dev)` version of your app. This should start the included sample Workflow.

To stop running locally, press `<CTRL> + C` to end the process.

When you click the link trigger URL in Slack, you can configure the channel list
as below:

<img src="https://user-images.githubusercontent.com/19658/206636945-e6078c32-0e81-422b-bb38-711d10f53b55.gif" width=500 />

Once the translator is added to a channel, adding reactions such as `:jp:` and
`:fr:` results in posting translation results of the target message as replies
in its thread.

<img width="600" src="https://user-images.githubusercontent.com/19658/206638194-6eff88fa-05c1-4308-a180-0a547890aab6.png">

## Testing

For an example of how to test a function, see `functions/translate_test.ts`.
Test filenames should be suffixed with `_test`.

Run all tests with `deno test`:

```zsh
$ deno test
```

## Deploying Your App

Once you're done with development, you can deploy the production version of your
app to Slack hosting using `slack deploy`. Also, please don't forget setting the
DeepL API token for the deployed app.

```zsh
$ slack deploy
$ slack env add DEEPL_AUTH_KEY (your key here)
```

After deploying, [create a new Link Trigger](#create-a-link-trigger) for the
production version of your app (not appended with `(dev)`). Once the Trigger is
invoked, the Workflow should run just as it did in when developing locally.

Also, for production-grade operations, we highly recommend enabling the
`maintenance_job.ts` workflow. This workflow requires the app's bot user to be a
member of the channels. When you add a new channel in the configuration modal,
the bot user automatically joins the channel. However, anyone can remove the bot
user from the channels at any time. To get the bot user back again, running the
daily maintenance job should be a good-enough solution. You can enable it by
running the folllowing command, which generates a scheduled trigger to run it
daily:

```bash
$ slack trigger create --trigger-def triggers/daily_maintenance_job.ts
```

### Viewing Activity Logs

Activity logs for the production instance of your application can be viewed with
the `slack activity` command:

```zsh
$ slack activity
```

## Project Structure

### `manifest.ts`

The [app manifest](https://api.slack.com/future/manifest) contains the app's
configuration. This file defines attributes like app name and description.

### `slack.json`

Used by the CLI to interact with the project's SDK dependencies. It contains
script hooks that are executed by the CLI and implemented by the SDK.

### `/functions`

[Functions](https://api.slack.com/future/functions) are reusable building blocks
of automation that accept inputs, perform calculations, and provide outputs.
Functions can be used independently or as steps in Workflows.

### `/workflows`

A [Workflow](https://api.slack.com/future/workflows) is a set of steps that are
executed in order. Each step in a Workflow is a function.

Workflows can be configured to run without user input or they can collect input
by beginning with a [form](https://api.slack.com/future/forms) before continuing
to the next step.

### `/triggers`

[Triggers](https://api.slack.com/future/triggers) determine when Workflows are
executed. A trigger file describes a scenario in which a workflow should be run,
such as a user pressing a button or when a specific event occurs.

## Resources

To learn more about developing with the CLI, you can visit the following guides:

- [Creating a new app with the CLI](https://api.slack.com/future/create)
- [Configuring your app](https://api.slack.com/future/manifest)
- [Developing locally](https://api.slack.com/future/run)

To view all documentation and guides available, visit the
[Overview page](https://api.slack.com/future/overview).
