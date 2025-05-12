import { Request, Response } from "express";
import { generateText } from "../utils/translate.utils";

const testLimits = async (req: Request, res: Response) => {
  const step = 500;
  const maxWordsToTry = 10000;
  let count = step;
  let lastSuccess = 0;

  while (count <= maxWordsToTry) {
    const testText = generateText("hola", count);

    try {
      const response = await fetch(
        `${process.env.LIBRETRANSLATE_API_URL}/translate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: testText,
            source: "es",
            target: "en",
          }),
        }
      );

      if (!response.ok) {
        console.warn(
          `❌ Falló con ${count} palabras - Status: ${response.status}`
        );
        break;
      }

      const data = await response.json();

      if (
        !data ||
        !data.translatedText ||
        typeof data.translatedText !== "string"
      ) {
        console.warn(`❌ Respuesta inesperada con ${count} palabras`);
        break;
      }

      console.log(`✅ Éxito con ${count} palabras`);
      lastSuccess = count;
      count += step;
    } catch (err) {
      console.error(`❌ Error con ${count} palabras`, err);
      break;
    }
  }

  return res.status(200).json({
    maxWordsSuccessful: lastSuccess,
    note: `Éxito hasta ${lastSuccess} palabras. Puede variar según los recursos del servidor.`,
  });
};

export const TranslationTestsController = {
  testLimits,
};
