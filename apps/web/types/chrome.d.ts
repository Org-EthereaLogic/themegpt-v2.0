/**
 * Minimal Chrome Extension API type declarations for external messaging.
 * Used by web pages to communicate with the ThemeGPT Chrome extension.
 */

interface ChromeExtensionResponse {
  success?: boolean
  installed?: boolean
  hasToken?: boolean
  message?: string
  version?: string
  error?: string
}

declare namespace chrome {
  namespace runtime {
    function sendMessage(
      extensionId: string,
      message: unknown,
      callback?: (response: ChromeExtensionResponse | undefined) => void
    ): void

    const lastError: { message?: string } | undefined
  }
}
