const net = require("node:net");
const { spawn } = require("node:child_process");
const { resolve } = require("node:path");

function optionValue(args, option, fallback) {
  let value = fallback;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === option) value = args[index + 1];
    else if (args[index].startsWith(`${option}=`))
      value = args[index].slice(option.length + 1);
  }
  return value;
}

async function assertPortAvailable(host, port) {
  await new Promise((resolveAvailable, reject) => {
    const listener = net.createServer();
    listener.once("error", reject);
    listener.listen(port, host, () => {
      listener.close((error) => {
        if (error) reject(error);
        else resolveAvailable();
      });
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const host = optionValue(args, "--host", "127.0.0.1");
  const port = Number(optionValue(args, "--port", "5176"));
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("Invalid local server host or port");
  // Vite initializes its optimizer before checking the listening port. A rejected
  // second start must not remove dependency files used by the active server.
  await assertPortAvailable(host, port);
  const child = spawn(
    process.execPath,
    [
      resolve(__dirname, "../node_modules/vite/bin/vite.js"),
      "--mode",
      "production",
      "--host",
      host,
      "--port",
      String(port),
      "--strictPort",
      ...args,
    ],
    { stdio: "inherit" },
  );
  const interrupt = () => child.kill("SIGINT");
  const terminate = () => child.kill("SIGTERM");
  process.on("SIGINT", interrupt);
  process.on("SIGTERM", terminate);
  child.once("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  child.once("exit", (code, signal) => {
    process.removeListener("SIGINT", interrupt);
    process.removeListener("SIGTERM", terminate);
    process.exitCode = code ?? (signal === "SIGINT" ? 130 : 143);
  });
}

main().catch((error) => {
  if (error.code === "EADDRINUSE")
    console.error(
      "Local server port is already in use. Keep the running server or stop it before restarting; its cache was preserved.",
    );
  else console.error(error.message);
  process.exitCode = 1;
});
