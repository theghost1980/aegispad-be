import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
} from "winston";

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  // Puedes incluir metadata si tus logs la tienen
  return `${timestamp} ${level}: ${message}`;
});

// --- Logger General para la Aplicación ---
export const AppLogger: WinstonLogger = createLogger({
  level: "info", // Nivel por defecto para este logger (ej: info, warn, error)
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat
      ),
      level: "info",
    }),
    new transports.File({
      filename: "application.log",
      level: "info",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
    new transports.File({
      filename: "errors.log",
      level: "error",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
  exitOnError: false,
});

export const LoginLogger: WinstonLogger = createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    new transports.File({
      filename: "login.log",
      level: "info",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
    // Opcional: Si quieres que los logs de login también aparezcan en la consola,
    // añade un Console transport aquí con su propio formato si es necesario.
    // new transports.Console({
    //     format: combine(
    //         colorize(),
    //         timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    //         printf(({ level, message, timestamp }) => {
    //           return `[LOGIN-EVENT] ${timestamp} ${level}: ${message}`; // Formato específico para logins en consola
    //         })
    //     )
    // }),
  ],
  exitOnError: false,
});
