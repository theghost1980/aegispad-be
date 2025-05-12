import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import sequelize from "./config/database";
import authRoutes from "./routes/auth.routes";
import statusRoutes from "./routes/status.routes";
import translateRoutes from "./routes/translate.routes";
import translationTestsRoutes from "./routes/translation.tests.routes";
import { AppLogger } from "./utils/logger.util";
import { checkLibreTranslateReadiness } from "./utils/translate.utils";

dotenv.config();

let retries = 10;
const retryInterval = 5000;
const app: Application = express();
const port = process.env.PORT || 3000;

export const secret = process.env.SECRET;
if (!secret) {
  AppLogger.error("Vital data in .env not found! Please check, contact admin!");
  process.exit(0);
}

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/translate", translateRoutes);

//TODO below protect as admin only
app.use("/api/admin/tests", translationTestsRoutes);

sequelize
  .authenticate()
  .then(() => {
    console.log("Conexión a la base de datos establecida correctamente.");
    return sequelize.sync({ alter: true });
  })
  .then(async () => {
    console.log("Modelos sincronizados correctamente.");
    //check api translation
    AppLogger.info("Waiting for LibreTranslate to be ready...");

    while (retries > 0) {
      const isReady = await checkLibreTranslateReadiness();
      if (isReady) {
        AppLogger.info("LibreTranslate is ready! Starting backend server...");
        break;
      }
      AppLogger.warn(
        `LibreTranslate not ready. Retrying in ${
          retryInterval / 1000
        } seconds... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
      retries--;
    }

    if (retries === 0) {
      AppLogger.error("LibreTranslate did not become ready. Exiting.");
      process.exit(1);
    }
    app.listen(port, () => {
      console.log(`Servidor escuchando en el puerto ${port}`);
    });
  })
  .catch((err: Error) => {
    console.error("No se pudo conectar a la base de datos:", err);
    process.exit(0);
  });
