const { events } = require("../validation/eventNames");
const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);
const Ascii = require("ascii-table");

/**
 *
 * @param client
 * @returns {Promise<void>}
 */
module.exports = async (client) => {
  const table = new Ascii("Events Loaded");

  (await PG(`${process.cwd()}/events/*.js`)).map(async (file) => {
    const event = require(file);
    if (!events.includes(event.name) || !event.name) {
      const l = file.split("/");
      await table.addRow(
        `${events.name || "Missing"}`,
        `⚠ Event Name is either invalid or missing ${l[6] + `/` + l[7]}`
      );
      return;
    }

    if (event.once)
      client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));

    await table.addRow(event.name, "✔ Successful");
  });

  console.log(table.toString());
};
