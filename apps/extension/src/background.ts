/**
 * ThemeGPT Background Service Worker
 *
 * Handles external messaging from themegpt.app for seamless OAuth authentication.
 * Listens for auth tokens sent from the web app and stores them for the popup.
 */

import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })

// Handle external messages from themegpt.app
chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {

    // Verify sender is from our trusted domains
    const allowedOrigins = [
      "https://themegpt.app",
      "https://www.themegpt.app"
    ]
    const senderOrigin = sender.url ? new URL(sender.url).origin : ""
    if (!allowedOrigins.includes(senderOrigin)) {
      sendResponse({ success: false, error: "Untrusted origin" })
      return true
    }

    switch (message.type) {
      case "themegpt-ping":
        // Respond to ping to indicate extension is installed
        sendResponse({
          success: true,
          installed: true,
          version: chrome.runtime.getManifest().version
        })
        break

      case "themegpt-auth":
        // Store the auth token
        if (message.token) {
          storage.set("authToken", message.token)
            .then(() => {
              // Notify any open popup about the new token
              chrome.runtime.sendMessage({
                type: "auth-token-updated",
                token: message.token
              }).catch(() => {
                // Popup might not be open, which is fine
              })
              sendResponse({ success: true, message: "Token saved" })
            })
            .catch((error) => {
              console.error("[ThemeGPT] Failed to save auth token:", error)
              sendResponse({ success: false, error: "Failed to save token" })
            })
          return true // Keep channel open for async response
        } else {
          sendResponse({ success: false, error: "No token provided" })
        }
        break

      case "themegpt-check-status":
        // Return current auth status
        storage.get<string>("authToken")
          .then((token) => {
            sendResponse({
              success: true,
              hasToken: !!token
            })
          })
          .catch(() => {
            sendResponse({ success: true, hasToken: false })
          })
        return true // Keep channel open for async response

      default:
        sendResponse({ success: false, error: "Unknown message type" })
    }

    return true // Keep channel open
  }
)

// Handle internal messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "get-auth-token") {
    storage.get<string>("authToken")
      .then((token) => {
        sendResponse({ success: true, token })
      })
      .catch(() => {
        sendResponse({ success: false, token: null })
      })
    return true
  }
})

export {}
