"use client";

import * as Sentry from "@sentry/nextjs";
import Head from "next/head";
import { useState } from "react";

export default function Page() {
  const [hasSentError, setHasSentError] = useState(false);

  return (
    <>
      <Head>
        <title>Sentry Example Page</title>
      </Head>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
            Sentry Example Page
          </h1>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            This page lets you verify that Sentry is capturing errors correctly.
          </p>
          <button
            type="button"
            onClick={() => {
              Sentry.captureException(new Error("Sentry example error — staging test"));
              setHasSentError(true);
            }}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#0B1F3D",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {hasSentError ? "Error sent! Check your Sentry dashboard." : "Throw error to Sentry"}
          </button>
          {hasSentError && (
            <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#16a34a" }}>
              The error has been captured. Go to your Sentry project to see it.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
