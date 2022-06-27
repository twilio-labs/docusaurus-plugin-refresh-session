# docusaurus-plugin-refresh-session

If you have a Docusaurus site that is protected by authentication, you need to handle specific errors that may happen on the client side when the authentication token expires. The client React SPA will try to fetch additional resources client-side when a user navigates to another page. If these resources fail to load due to an expired authentication token, we need to redirect the user to the login page so they can reauthenticate.

This has been tested with Docusaurus running on Netlify using [netlify-okta-auth](https://github.com/twilio-labs/netlify-okta-auth).

## Installation

```bash
npm install --save @twilio-labs/docusaurus-plugin-refresh-session
```

**Or, if you prefer Yarn:**

```bash
yarn add @twilio-labs/docusaurus-plugin-refresh-session
```

## Configuration

Accepted fields:

| Name          | Type     | Default | Description                            |
| ------------- | -------- | ------- | -------------------------------------- |
| `redirectUrl` | `string` | `""`    | Url to redirect to when login expires. |

If `redirectUrl` is left empty, it will just refresh the current page.

### Example configuration

#### docusaurus.config.js

Use defaults:

```js
  plugins: [
    "@twilio-labs/docusaurus-plugin-refresh-session",
  ],
```

Specify `redirectUrl`:

```js
  plugins: [
    [
      "@twilio-labs/docusaurus-plugin-refresh-session",
      {
        redirectUrl: "https://example.com/login"
      },
    ],
  ],
```

## Other features

If you are using [Segment](https://segment.com) to track your site (perhaps using the [docusaurus-plugin-segment](https://github.com/twilio-labs/docusaurus-plugin-segment) package), this plugin will send an even to Segment whenever the session is refreshed.

If you aren't using Segment, nothing is tracked.
