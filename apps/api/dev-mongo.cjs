const { MongoMemoryServer } = require("mongodb-memory-server");

(async () => {
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27117, ip: "127.0.0.1", launchTimeout: 60000 },
  });
  console.log("MONGO_READY " + mongod.getUri());

  process.on("SIGTERM", async () => {
    await mongod.stop();
    process.exit(0);
  });
})();
