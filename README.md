# Wedding Manager

<!-- GitHub markdown doesn't allow for sizing images, so this has to be defined as HTML. Gross. -->
<p align="left">
  <img src="./web/public/img/ring.svg" alt="Ashley's Engagement Ring" width="100" height="100"/>
</p>

- [Description](#description)
  - [Features](#features)
- [Dependencies](#dependencies)
  - [Peer Services](#peer-services)
  - [Assets](#assets)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Configuration](#configuration)
  - [Building Assets](#building-assets)
  - [Running the Server](#running-the-server)
  - [First Use](#first-use)
  - [External Administrative Access](#external-administrative-access)
- [Deployment](#deployment)
  - [Build](#build)
  - [Running the Service](#running-the-service)

## Description

Wedding Manager is a service I initially created to manage invitations for my wedding to my beautiful fiancée, Ashley.

Once started it eventually grew in scope to be a service for both us as the wedding couple to keep track of invitations, their status, and have a convenient way of tracking counts we would need leading up to the big day, as well as for our guests themselves to manage their RSVPs and access information they may need or be interested in surrounding the event.

### Features

For use by invited guests:

- Ability to manage their RSVP status for both the wedding ceremony and reception
- Selection of menu choices for the wedding breakfast
- Comments on dietary requirements/restrictions to be aware of or ones which are not covered by provided options
- Adding any children who may be joining them, as well as their menu choices and dietary requirements
- Song recommendations for the reception
- Leaving a message for us
- Downloading a calendar event for the wedding day
- View details surrounding the event, such as travel information, accommodation recommendations, schedules, etc
- Q&A page
- "Our Story" timeline
- Gallery
- Feedback system for additional questions or comments about the service

Management/Administration capabilities:

- Stats overview showing a breakdown of guest count, RSVP status, etc.
- Creation and management of invitation records, allowing the configuration of recipient(s) and their number of +1s
- Access to view invitation RSVP status and their responses to menu selections, song requests, and left messages
- Generation of personalised invitation card to be downloaded or shared with guests
- Management of available menu options per course and their dietary applicability
- Management of provided calendar event(s)
- Dynamic management of the details page content
- Dynamic management of the Q&A page content
- Dynamic management of the "Our Story" timeline content
- Dynamic management of the Gallery page content
- Ability to view and manage provided feedback
- Ability to create and manage adminstrative auth tokens for headless service management

## Dependencies

### Peer Services

The only peer service that wedding manager requires is a MongoDB database.
It was developed against 8.0, however it should function on earlier versions as it should not make use of newer features.

### Assets

> [!WARNING]
> So as to keep the project generic (and to avoid committing files which are only licensed for private use), there are a few references to assets in the front-end codebase which are specifically not included in the repository, and should be defined or have their code references updated as is appropriate for the running service.

The following is a list of all the assets which are required to be provided or their values modified for the service to load (as intended and without errors, anyway)

Name | Location | Use | Expected value
--- | --- | --- | ---
Background Image | [./web/public/img/background.{jpeg\|webp\|avif}](./web/public/img/) | The image to use as the website background | A set of three images to be used for the background of the website, sourced depending on requesting browser support
Invitation Card Border SVG | [./web/public/img/invitation/border.svg](./web/public/img/) | An image to be used as themed corner decorations on the generated invitation cards. | A valid SVG file with a single `fill="something"` intended to be updated by the front-end client
Script Font | [./web/public/font](./web/public/font) or [./web/src/scss/_fonts.scss](web/src/scss/_fonts.scss) | Used for the fancier script font text | Either source your own copy of Eyesome Script (which has a free for private use license) and place it in the public font directory, or update the stylesheet to set your own font of choice to the `.font-script` class

The following are a collection of codebase locations to make easy adjustments to further personalise the use of the service

Name | Location | Use | Expected value
--- | --- | --- | ---
Bootstrap overrides | [./web/src/scss/_vars.scss](./web/src/scss/_vars.scss) | Adjust the bootstrap variable overrides | SCSS overrides for bootstrap's scss variables outside of the primary/secondary set in conf. [See their documentation for more details.](https://getbootstrap.com/docs/5.3/customize/color/)

## Development

### Prerequisites

The following tools are required to be installed on your development machine in order to build or run the service:

- [Node.js](https://nodejs.org/en) - Recommended to install the latest LTS version from whenever you are reading this.
- [Docker](https://www.docker.com/) - Either docker desktop or other compatible engine that allows use of the docker CLI.

### Configuration

The application was designed from the start to be generic and not have anything hard-coded to my specific use case, so all of the data included in the repository should be only what is necessary for the service itself to run, the rest is driven by configuration.

If you want to run your own version of this service, then there are two places you configure content, depending on whether it is content that is static (such as your names, wedding date, hosted domain, etc) or content that you would want to change without having to redeploy it (like the Q&A content, details page content, etc.).

The dynamic content of the application is all configurable via the service's administration UI and API. Once you have an admin user to access the application then you will be presented with it as soon as you sign in.

For the static content, that is all defined as environment variables and contains a mix of fields that are just for the backend server, the front-end client, or used by both. The full set of configurable variables are as follows:

Name | Description | Type | Default
--- | --- | --- | ---
`HOST` | The address the service will be hosten on | String | The local IP address of the host computer
`HOT` | Whether to enable hot module reloading of the front-end client | Boolean | `false`
`BRIDE` | Full name of the bride | String | N/A
`BRIDE_SHORT` | First name or nickname of the bride | String | N/A
`GROOM` | Full name of the groom | String | N/A
`GROOM_SHORT` | First name or nickname of the groom | String | N/A
`DATE` | Date of the wedding | Timestamp, or String that is accepted by JS [`Date.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse) | N/A
`OAUTH_CLIENTID` | The Client ID of a Google OAuth 2.0 Client to facilitate external administrative access | String | N/A
`SERVER_PORT` | Port the running server will listen for requests on | Number | N/A
`SERVER_EXTERNALPORT` | Port the server will expect to have requests served from, assuming it is being run behind a reverse proxy | Number | `443`
`SERVER_DB_HOST` | Hostname/IP and optionally port of the MongoDB database the service will connect to | String | N/A
`SERVER_DB_DB` | The named database to connect to on the provided host | String | N/A
`SERVER_DB_USERNAME` | The username of the database user which has access to the configured named db | String | N/A
`SERVER_DB_PASSWORD` | The password of the database user which has access to the configured named db | String | N/A
`SERVER_SESSION_NAME` | Name to use for the browser session cookie | String | `'invitation'`
`SERVER_SESSION_SECRET` | The secret used to sign the session ID cookie | String value that is supported by the key param of the Node.js [`crypto.createHmac()`](https://nodejs.org/api/crypto.html#cryptocreatehmacalgorithm-key-options) | N/A
`CLIENT_FOOTER` | Content to include in the footer of the front-end client | An individual footer item is defined in markdown link syntax `[text](url)`, and multiple items split by `\|` | N/A
`CLIENT_PALETTE` | Colour palette to show on the admin colour palette view. Note this does not apply to any stylesheets | An individual palette item is defined in as comma-separated text and value, with multiple items split by `\|` | N/A
`CLIENT_THEME` | Names of scss variables to overload the base styles with | comma-separated list of variable names (character set `a-zA-Z-`) | N/A
`CLIENT_THEME_*` | Value of the scss variable defined in `CLIENT_THEME`, where `*` is an all-caps equivalent of the variable name | Valid scss variable value | N/A

> [!NOTE]
> It is not used directly used by the application, but be sure to set `NODE_ENV` to `production` when building the application for production use. This will ensure reduced built front-end asset size and more optimal performance by the running server.

These environment variables can either be set manually when running the various commands, or (more conveniently) in a `.env` file in the projects root directory, such as the following example for running a local development server:

```bash
# ./.env
HOT=true
DATE=2025/12/31
HOST=127.0.0.1

BRIDE="Jane Doe"
GROOM="Joe Bloggs"
BRIDE_SHORT=Janey
GROOM_SHORT=Joe

SERVER_PORT=8080
SERVER_EXTERNALPORT=8443
SERVER_DB_HOST=127.0.0.1
SERVER_DB_DB=wedding-manager
SERVER_DB_USERNAME=dbuser
SERVER_DB_PASSWORD=hunter2
SERVER_SESSION_SECRET=sOm35ECretV4lUE

CLIENT_FOOTER="[Example Venue](https://venue.example.com/)"
CLIENT_PALETTE="Blue,#0000ff|White,#ffffff|Gold,#ffd700"
CLIENT_THEME=primary,secondary,border-color
CLIENT_THEME_PRIMARY=#4f7942
CLIENT_THEME_SECONDARY=darkslateblue
CLIENT_THEME_BORDERCOLOR='$secondary'
```

### Building Assets

> [!NOTE]
> If you have not already, be sure to run `npm install` from the project root before continuing.

If you're running a local service to develop against, you'll likely want to run the asset builds using the webpack dev server with its hot module reloading enabled. To use this, have the following command running in its own terminal window/tab:

```console
npm run build-hot
```

### Running the Server

Now you've got the assets ready to use, it's time to get the server up and running. Once again if you're running the service to develop against, you'll likely want to have it automatically restart on file changes. To do this, run the following command in its own terminal window/tab:

```console
npm run watch
```

### First Use

The only data that needs to be created in the database manually before it can be used is an initial admin user. To create this user, access the mongo shell to your configured database host and db and run the following command (where `<your_id>` is whatever id it is you want to use to access the system):

```javascript
db.invitations.insertOne({ id: '<your_id>', admin: true })
```

Once the initial administrative user has been created and the service is up and running, additional administrators can be created by navigating to the Administrators view on the admin home page.

> [!IMPORTANT]
> One thing to note around elevated users, due to the deliberately simple authentication nature of the application, by default sessions for invitation records with elevated access will only ever be granted by requests made within the local network of the running server. See [src/lib/admin.js](./src/lib/admin.js) for more details on which addresses that includes.
>
> If you wish for external administrative access to the application, that can be facilitated by the use of Google's OAuth 2.0 sign in. To enable this, follow the steps below.

### External Administrative Access

External administrative access to the application can optionally be enabled via integration with Google's OAuth 2.0 sign in. To enable this functionality, follow step 1 and optionally step 2 on Google's [Sign in with Google for Web Setup Guide](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).

Once you have the Client ID from your Google Cloud account, set it in your configuration file as `OAUTH_CLIENTID` and rebuild the application.

Once you have the client configured, you will need to create an admin user which is specifically configured to integrate with the OAuth provider. This functionality is separate to the base admin account we created earlier, in that it has an additional property and restriction applied to the record in the database. Specifically, the record will need its `id` value to be the email address you are expecting to be returned from the OAuth provider, as well as an additional `email` property which should be set to `true`. E.g.:

```javascript
db.invitations.insertOne({ id: '<your_google_email>', admin: true, email: true })
```

External OAuth administrators can also be created via the Administrators administrative view on the running service once the Client ID has been configured.

## Deployment

> [!NOTE]
> If you have not already, be sure to run `npm install` from the project root before continuing.

### Build

Ensuring you have `NODE_ENV` set to `production` in your `.env` file, run:

```console
npm run build
```

This will perform a production build of the front-end assets ready to be served to a web browser.

Even though it could be run on a bare machine, the project is designed to have its server be ran as a docker container.
Building an image to run the application is as simple as running the following command from the root of the project directory (assuming you have docker CLI installed).

```console
docker buildx build --network=host -t wedding-manager:latest .
```

### Running the Service

Once you have a built docker image, you can run it on your target host like any other docker image, just be sure to supply the necessary env vars defined and passed through to the run command in your method of choice:

```console
# Using a .env file
docker run --env-file /path/to/.env -d --network=host --name=wedding-manager --restart unless-stopped wedding-manager:latest

# Or using direct environment variables (not recommended)
docker run -e HOST=... -d --network=host --name=wedding-manager --restart unless-stopped wedding-manager:latest
```

In theory you should now have a running production-like service running the server and hosting the front-end assets. The final thing that is highly recommended (and built with the intention for) is to have the service running behind a reverse proxy, such as nginx or haproxy.
Now I'll leave the decision of which to use or how or where to host it, however I will say to ensure you configure it to handle SSL and https protocol upgrading, and to **ensure** that it is configured to set the following headers for the requests that are sent to the service:

```text
X-Forwarded-For
X-Forwarded-Proto
X-Forwarded-Scheme
```

> [!WARNING]
> Without these headers being supplied to the service then the service may refuse to send session cookies to clients, and may allow requests to bypass the request rate limiting that is in place for requests made without a valid session.
