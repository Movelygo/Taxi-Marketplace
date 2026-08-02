// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://62ffcde1ca728172eca2bc6d340d7766@o4511147374149632.ingest.us.sentry.io/4511843514712064",

  tracesSampleRate: 1,
  enableLogs: true,

  beforeSend(event) {
    if (event.user) {
      delete event.user.ip_address
    }
    return event
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
