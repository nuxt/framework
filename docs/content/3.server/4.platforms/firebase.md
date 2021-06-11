# Firebase Hosting

> How to deploy Nuxt to Firebase Hosting with Nuxt Nitro

 - Support for serverless SSR build
 - Minimal configuration required

## Setup

Nitro supports Firebase Hosting with Cloud Functions out of the box.

**Note**: You will need to be on the **Blaze plan** in order to use Nitro with Cloud Functions.

### Using Nitro

If you don't already have a `firebase.json` in your root directory, Nitro will create one the first time you run it. All you will need to do is edit this to replace `<your_project_id>` with the project ID that you have chosen on Firebase.

This file should then be committed to version control. You can also create a `.firebaserc` file if you don't want to manually pass your project ID to your `firebase` commands (with `--project <your_project_id>):
```json [.firebaserc]
{
  "projects": {
    "default": "<your_project_id>"
  }
}
```

Then, just add Firebase dependencies to your project:

```bash
yarn add --dev firebase-admin firebase-functions firebase-functions-test
```

### Using Firebase CLI

You may instead prefer to set up your project with the `firebase` CLI, which will fetch your project ID for you, add required dependencies (see above) and even set up automated deployments via GitHub Actions.

```bash
# Install firebase CLI globally
yarn global install firebase-tools
# Initialize your firebase project
firebase login
firebase init hosting
```

When prompted, you can enter `.output/public` as the public directory. **Don't** select that this will be a single-page app.

Once complete, add the following to your `firebase.json` to enable server rendering in Cloud Functions:
```json [firebase.json]
{
  "functions": { "source": ".output/server" },
  "hosting": [
    {
      "site": "<your_project_id>",
      "public": ".output/public",
      "cleanUrls": true,
      "rewrites": [{ "source": "**", "function": "server" }]
    }
  ]
}
```

You can find more details in the [Firebase documentation](https://firebase.google.com/docs/hosting/quickstart).

## Local preview

You can preview a local version of your site if you need to test things out without deploying.

```bash
NITRO_PRESET=firebase yarn build
firebase emulators:start
```

## Deploy to Firebase Hosting via CLI

Deploying to Firebase Hosting is a simple matter of just running the `firebase deploy` command.

```bash
NITRO_PRESET=firebase yarn build
firebase deploy
```

## Demo site

A live demo is available on https://nitro-demo-dfabe.web.app
