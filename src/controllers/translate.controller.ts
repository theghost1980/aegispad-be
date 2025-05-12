import { Request, Response } from "express";
import { LIBRETRANSLATE_API_URL, TRANSLATE_ENDPOINT } from "../constants/apis";
import { TranslationLanguage } from "../interfaces/translation.api.interface";
import { AppLogger } from "../utils/logger.util";

const translate = async (req: Request, res: Response) => {
  const { q, target, source = "auto" } = req.body;
  console.log({ q, target, source }); //TODO REM
  if (!q || (typeof q !== "string" && !Array.isArray(q))) {
    AppLogger.warn(
      "Translate request failed: 'q' is missing or not a string/array."
    );
    return res.status(400).json({
      error:
        "'q' parameter is required and must be a string or an array of strings.",
    });
  }
  if (Array.isArray(q) && q.some((item) => typeof item !== "string")) {
    AppLogger.warn(
      "Translate request failed: 'q' array contains non-string elements."
    );
    return res
      .status(400)
      .json({ error: "'q' array must only contain strings." });
  }
  if (typeof q === "string" && !q.trim()) {
    return res.status(200).json({ translatedTexts: [""] });
  }
  if (
    Array.isArray(q) &&
    q.every((item) => typeof item === "string" && !item.trim())
  ) {
    return res.status(200).json({ translatedTexts: q.map(() => "") });
  }

  if (!target || typeof target !== "string") {
    AppLogger.warn(
      "Translate request failed: 'targetLang' is missing or not a string."
    );
    return res.status(400).json({
      error: "'targetLang' parameter is required and must be a string.",
    });
  }
  if (typeof source !== "string") {
    AppLogger.warn("Translate request failed: 'sourceLang' is not a string.");
    return res
      .status(400)
      .json({ error: "'sourceLang' parameter must be a string if provided." });
  }

  if (!LIBRETRANSLATE_API_URL) {
    AppLogger.error("LIBRETRANSLATE_API_URL is not configured.");
    return res
      .status(500)
      .json({ error: "Translation service not configured on the server." });
  }

  try {
    const textsToTranslate = Array.isArray(q) ? q : [q];

    const libreTranslateRes = await fetch(
      `${LIBRETRANSLATE_API_URL}${TRANSLATE_ENDPOINT}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Si LibreTranslate requiere un API Key, añádelo aquí desde tus variables de entorno
          // 'Authorization': `Bearer ${process.env.LIBRETRANSLATE_API_KEY}`
        },
        body: JSON.stringify({
          q: textsToTranslate,
          source: source,
          target: target,
        }),
      }
    );

    if (!libreTranslateRes.ok) {
      const errorBody = await libreTranslateRes.text();
      AppLogger.error(
        `LibreTranslate API returned error status: ${libreTranslateRes.status}`,
        { body: errorBody, requestQ: q }
      );
      return res.status(libreTranslateRes.status).json({
        error: `Error translating texts: ${libreTranslateRes.statusText}`,
      });
    }

    const libreTranslateData: any = await libreTranslateRes.json();

    if (
      !libreTranslateData ||
      !Array.isArray(libreTranslateData.translatedText) ||
      libreTranslateData.translatedText.some(
        (item: any) => typeof item !== "string"
      )
    ) {
      AppLogger.error(
        "LibreTranslate API returned unexpected response format. Expected { 'translatedText': string[] }",
        { response: libreTranslateData, requestQ: q }
      );
      return res.status(500).json({
        error: "Translation service returned data in an unexpected format.",
      });
    }

    const translatedTexts = libreTranslateData.translatedText;

    if (translatedTexts.length !== textsToTranslate.length) {
      AppLogger.error(
        `LibreTranslate returned unexpected number of translated texts. Sent: ${textsToTranslate.length}, Received: ${translatedTexts.length}`,
        { translatedTexts: translatedTexts, requestQ: q }
      );
      return res.status(500).json({
        error: `Translation service returned an inconsistent number of translated texts. Expected ${textsToTranslate.length}, got ${translatedTexts.length}.`,
      });
    }
    const fixedForTables = translatedTexts.map((t: string) =>
      t.replace(/- 124;?/g, "|")
    );
    AppLogger.info(
      `Translation successful. Translated ${fixedForTables.length} texts.`
    );
    return res.status(200).json({ translatedTexts: fixedForTables });
  } catch (error: any) {
    AppLogger.error("Error calling LibreTranslate API:", error);
    return res
      .status(500)
      .json({ error: "Failed to communicate with the translation service." });
  }
};

const languages = async (req: Request, res: Response) => {
  if (!LIBRETRANSLATE_API_URL) {
    AppLogger.error("LIBRETRANSLATE_API_URL is not configured.");
    return res
      .status(500)
      .json({ error: "Translation service not configured on the server." });
  }
  try {
    const libreTranslateRes = await fetch(
      `${LIBRETRANSLATE_API_URL}/languages`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Si LibreTranslate requiere un API Key, añádelo aquí desde tus variables de entorno
          // 'Authorization': `Bearer ${process.env.LIBRETRANSLATE_API_KEY}`
        },
      }
    );

    if (!libreTranslateRes.ok) {
      const errorBody = await libreTranslateRes.text();
      AppLogger.error(
        `LibreTranslate API returned error status: ${libreTranslateRes.status}`,
        { body: errorBody }
      );
      return res.status(libreTranslateRes.status).json({
        error: `Error from translation service: ${libreTranslateRes.statusText}`,
      });
    }

    const libreTranslateDataList: TranslationLanguage[] =
      await libreTranslateRes.json();
    AppLogger.info(`Translation done!`);
    console.log({ libreTranslateDataList }); //TODO REM
    return res
      .status(200)
      .json({ success: true, list: libreTranslateDataList });
  } catch (error: any) {
    AppLogger.error("Error calling LibreTranslate API:", error);
    return res
      .status(500)
      .json({ error: "Failed to communicate with the translation service." });
  }
};

//TODO removar luego de prubas
const translateTest = async (req: Request, res: Response) => {
  //TODO bellow testing
  // return res.status(200).json({ done: true });

  const { q, target, source = "auto" } = req.body;

  // console.log({ q, target, source }); //TODO REM

  if (!q || (typeof q !== "string" && !Array.isArray(q))) {
    AppLogger.warn(
      "TranslateTest request failed: 'q' is missing or not a string/array."
    );
    return res.status(400).json({
      error:
        "'q' parameter is required and must be a string or an array of strings.",
    });
  }
  if (Array.isArray(q) && q.some((item) => typeof item !== "string")) {
    AppLogger.warn(
      "TranslateTest request failed: 'q' array contains non-string elements."
    );
    return res
      .status(400)
      .json({ error: "'q' array must only contain strings." });
  }
  if (typeof q === "string" && !q.trim()) {
    return res.status(200).json({ translatedTexts: [""] });
  }
  if (
    Array.isArray(q) &&
    q.every((item) => typeof item === "string" && !item.trim())
  ) {
    return res.status(200).json({ translatedTexts: q.map(() => "") });
  }

  if (!target || typeof target !== "string") {
    AppLogger.warn(
      "TranslateTest request failed: 'targetLang' is missing or not a string."
    );
    return res.status(400).json({
      error: "'targetLang' parameter is required and must be a string.",
    });
  }
  if (typeof source !== "string") {
    AppLogger.warn(
      "TranslateTest request failed: 'sourceLang' is not a string."
    );
    return res
      .status(400)
      .json({ error: "'sourceLang' parameter must be a string if provided." });
  }

  if (!LIBRETRANSLATE_API_URL) {
    AppLogger.error(
      "LIBRETRANSLATE_API_URL is not configured for TranslateTest."
    );
    return res
      .status(500)
      .json({ error: "Translation service not configured on the server." });
  }

  try {
    const textsToTranslate = Array.isArray(q) ? q : [q];

    const libreTranslateRes = await fetch(
      `${LIBRETRANSLATE_API_URL}${TRANSLATE_ENDPOINT}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: textsToTranslate,
          source: source,
          target: target,
        }),
      }
    );

    if (!libreTranslateRes.ok) {
      const errorBody = await libreTranslateRes.text();
      AppLogger.error(
        `LibreTranslate API returned error status for TranslateTest: ${libreTranslateRes.status}`,
        { body: errorBody, requestQ: q }
      );
      return res.status(libreTranslateRes.status).json({
        error: `Error translating texts: ${libreTranslateRes.statusText}`,
      });
    }

    const libreTranslateData: any = await libreTranslateRes.json();

    if (
      !libreTranslateData ||
      !Array.isArray(libreTranslateData.translatedText) ||
      libreTranslateData.translatedText.some(
        (item: any) => typeof item !== "string"
      )
    ) {
      AppLogger.error(
        "LibreTranslate API returned unexpected response format for TranslateTest. Expected { 'translatedText': string[] }",
        { response: libreTranslateData, requestQ: q }
      );
      return res.status(500).json({
        error: "Translation service returned data in an unexpected format.",
      });
    }

    const translatedTexts = libreTranslateData.translatedText;

    if (translatedTexts.length !== textsToTranslate.length) {
      AppLogger.error(
        `LibreTranslate returned unexpected number of translated texts for TranslateTest. Sent: ${textsToTranslate.length}, Received: ${translatedTexts.length}`,
        { translatedTexts: translatedTexts, requestQ: q }
      );
      return res.status(500).json({
        error: `Translation service returned an inconsistent number of translated texts. Expected ${textsToTranslate.length}, got ${translatedTexts.length}.`,
      });
    }
    AppLogger.info(
      `Translation successful for TranslateTest. Translated ${translatedTexts.length} texts.`
    );
    return res.status(200).json({ translatedTexts });
  } catch (error: any) {
    AppLogger.error(
      "Error calling LibreTranslate API for TranslateTest:",
      error
    );
    return res
      .status(500)
      .json({ error: "Failed to communicate with the translation service." });
  }
};

export const TranslateController = {
  translate,
  languages,
  translateTest, // Asegúrate de exportar la nueva función
};
