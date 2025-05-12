import { AppLogger } from "./logger.util";

const LIBRETRANSLATE_API_URL = process.env.LIBRETRANSLATE_API_URL;
const LANGUAGES_ENDPOINT = "/languages";

/**
 * Verifica si la API del traductor está lista y cargada.
 * Realiza una petición al endpoint /languages.
 * @returns Una promesa que se resuelve a true si LibreTranslate está listo, false en caso contrario.
 */
export const checkLibreTranslateReadiness = async (): Promise<boolean> => {
  if (!LIBRETRANSLATE_API_URL) {
    AppLogger.warn(
      "LIBRETRANSLATE_API_URL is not configured. Cannot perform health check."
    );
    return false;
  }

  const healthCheckUrl = `${LIBRETRANSLATE_API_URL}${LANGUAGES_ENDPOINT}`;
  const timeout = 5000;

  AppLogger.info(`Checking LibreTranslate readiness at: ${healthCheckUrl}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(healthCheckUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Si LibreTranslate requiere una API Key incluso para /languages, añádela aquí
        // 'Authorization': `Bearer ${process.env.LIBRETRANSLATE_API_KEY}`
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      try {
        const data: any = await res.json();
        if (Array.isArray(data)) {
          AppLogger.info("LibreTranslate is ready.");
          return true;
        } else {
          AppLogger.warn(
            "LibreTranslate responded 200 OK but with unexpected body format.",
            { responseBody: data }
          );
          return false;
        }
      } catch (jsonError: any) {
        AppLogger.warn(
          "LibreTranslate responded 200 OK but failed to parse JSON body.",
          { error: jsonError }
        );
        return false;
      }
    } else {
      AppLogger.warn(`LibreTranslate responded with status: ${res.status}`);
      return false;
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      AppLogger.warn(
        `LibreTranslate health check timed out after ${timeout}ms.`
      );
    } else {
      AppLogger.error("Error during LibreTranslate health check:", error);
    }
    return false;
  }
};

export const generateText = (word: string, count: number) =>
  Array(count).fill(word).join(" ");
