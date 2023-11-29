import path from "path";

export let temporaryImageDirectory: string;

if (process.env.DEV && process.env.DEV === "Yes") {
  temporaryImageDirectory = path.join(__dirname, `../../tmp/db/userData.json`);
} else {
  temporaryImageDirectory = "/tmp/db/userData.json";
}
