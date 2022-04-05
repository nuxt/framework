import { resolve } from "pathe";
import { read, update } from "rc9";
import consola from "consola";
// import { findModule } from "../utils/modules";
import { defineNuxtCommand } from "./index";
const { install } = require("lmify");

export default defineNuxtCommand({
  meta: {
    name: "module",
    usage: "npx nuxi module add|remove <npm-name> [--cwd]",
    description: "Add or remove a module",
  },
  async invoke(args) {
    const cwd = resolve(args.cwd || ".");

    const action = args._[0];
    const name = args._[1];

    // Validate options
    if (!action) {
      console.error("Action argument is missing!");
      process.exit(1);
    }
    if (!name) {
      consola.error("Name argument is missing!");
      process.exit(1);
    }

    // // Checking if provided package is a Nuxt Module
    // const module = await findModule(name)
    // if (!module) { consola.error('Please ensure you try to install a Nuxt3 module!') }

    // Read Configuration .nuxtrc in project directory
    const config = await read({ name: ".nuxtrc", dir: cwd });
    let modules = config.modules || [];

    if (action.toLowerCase() === "add") {
      if (modules.includes(name)) {
        return consola.warn("Module already installed.");
      }

      // Updating module array
      modules.push(name);

      // Installing dependencies
      await install(name);
      consola.success(`Added Module ${name}`);
    } else if (action.toLowerCase() === "remove") {
      modules = modules.filter((x) => x != name);
      consola.success(`Removing Module ${name} from configuration`);
    }

    // Applying new modules settings to config
    config.modules = modules;
    update(config, { name: ".nuxtrc", dir: cwd });
  },
});
