const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// ─── Fix: socket.io-client ESM build tries to import Node.js-only transports
// that don't exist in React Native / Metro. We stub them out so Metro doesn't
// crash, while the actual socket connection uses websocket + polling transports
// that ARE available in React Native.
//
// Affected modules (all inside engine.io-client/build/esm/transports/):
//   polling-fetch.js      → uses the Fetch API (Node 18+), not available in RN
//   polling-xhr.node.js   → Node.js-specific XHR shim
//   websocket.node.js     → Node.js ws package, not used in RN (uses native WS)
//   globals.node.js       → Node.js globals shim
// ─────────────────────────────────────────────────────────────────────────────

const NODE_ONLY_MODULES = [
  /engine\.io-client.*transports[/\\]polling-fetch\.js$/,
  /engine\.io-client.*transports[/\\]polling-xhr\.node\.js$/,
  /engine\.io-client.*transports[/\\]websocket\.node\.js$/,
  /engine\.io-client.*globals\.node\.js$/,
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const fullPath = moduleName;
  const isNodeOnly = NODE_ONLY_MODULES.some((re) => re.test(fullPath));

  if (isNodeOnly) {
    // Return an empty module — Metro will bundle it as `module.exports = {}`
    return { type: "empty" };
  }

  // Default resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
