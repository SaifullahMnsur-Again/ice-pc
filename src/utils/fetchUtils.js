// ice-pc\src\utils\fetchUtils.js

/**
 * Fetches a URL with retry logic for transient network errors.
 * Includes more specific error messages for debugging.
 * @param {string} url The URL to fetch.
 * @param {RequestInit} [options] Fetch options.
 * @param {number} [retries=3] Number of retry attempts.
 * @param {number} [delay=1000] Initial delay between retries in milliseconds.
 * @returns {Promise<Response>} The fetch response.
 * @throws {Error} If the fetch fails after all retries.
 */
export async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        // Log more details for non-OK responses
        const errorDetails = `HTTP status: ${response.status}, text: ${await response.text().catch(() => 'N/A')}`;
        // If it's a server error (5xx) or a temporary network issue, retry.
        // For client errors (4xx), it's usually not retriable unless it's a 408.
        if (response.status >= 500 || response.status === 408) { // 408 Request Timeout is also retriable
          throw new Error(`Retriable HTTP error for ${url}! ${errorDetails}`, { cause: response.status });
        }
        // For other non-OK responses (e.g., 404 Not Found, 403 Forbidden), throw immediately
        throw new Error(`Non-retriable request failed for ${url} with ${errorDetails}`, { cause: response.status });
      }
      return response;
    } catch (error) {
      console.warn(`Fetch attempt ${attempt + 1} failed for ${url}: ${error.message}`);
      attempt++;
      if (attempt < retries) {
        const backoffDelay = delay * Math.pow(2, attempt - 1); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      } else {
        // Re-throw the error if all retries are exhausted
        throw new Error(`Failed to fetch ${url} after ${retries} attempts. Last error: ${error.message}`);
      }
    }
  }
  // This line should technically not be reached if retries > 0, but as a fallback
  throw new Error(`Failed to fetch ${url}: Unknown error after all retries.`);
}
