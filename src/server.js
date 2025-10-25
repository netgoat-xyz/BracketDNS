const dgram = require("node:dgram");
const server = dgram.createSocket("udp4");
const connectDB = require("./config/connectDB");
const Domain = require("./DB/Models/Domain.model");
const logger = require("./logger").default;

const { decode, encode } = require("./dnsCore");
const { stopReporting, startReporting } = require("./statsReporter");
const {
  REGION_CITY,
  REGION_CONTINENT,
  REGION_COUNTRY,
  ZONE_AUTH,
  HOST_DOMAIN,
} = process.env;

server.bind(53, "0.0.0.0");

logger.info("Starting DNS server...");

connectDB();

server.on("message", async (msg, rinfo) => {
  const packet = decode(msg);
  logger.info("packet", packet);
  try {
    const domainName = packet.questions[0].name;
    const domain = await Domain.findOne({ domainName });

    if (!domain) {
      logger.error(`Domain ${domainName} not found in database`);
      return;
    }

if (
  domain.zone.toLowerCase() !==
  `${Array.from(REGION_CONTINENT)[0]}${REGION_COUNTRY}${
    Array.from(REGION_CITY)[0]
  }.${ZONE_AUTH}.${HOST_DOMAIN}`.toLowerCase()
) {
  console.log(
    `${Array.from(REGION_CONTINENT)[0]}${REGION_COUNTRY}${
      Array.from(REGION_CITY)[0]
    }.${ZONE_AUTH}.${HOST_DOMAIN}`.toLowerCase()
  );
  console.log(domain.zone);
  logger.error(`Domain ${domainName} does not belong to the configured zone`);
  return;
}


    const response = encode({
      type: "response",
      id: packet.id,
      flags: 0x8180,
      questions: packet.questions,
      answers: [
        {
          type: domain.type,
          class: "IN",
          name: domainName,
          data: domain.value,
        },
      ],
    });

    server.send(response, rinfo.port, rinfo.address, (err) => {
      if (err) {
        logger.error(err);
      }
    });
  } catch (error) {
    logger.error(`Error processing DNS request: ${error}`);
  }
});

server.on("error", (err) => {
  logger.error(`server error:\n${err.stack}`);
  server.close();
});

server.on("listening", async () => {
  const address = server.address();
  logger.success(
    `⭐ BracketDNS [${`${Array.from(REGION_CONTINENT)[0]}${REGION_COUNTRY}${
      Array.from(REGION_CITY)[0]
    }.${ZONE_AUTH}.${HOST_DOMAIN}`.toLowerCase()}] up on ${address.address}:${
      address.port
    } ⭐`
  );

  await startReporting({
    serverUrl: process.env.Central_server,
    sharedJwt: process.env.Central_JWT,
    category: "dns_nameserver",
    intervalMinutes: 1,
    service: process.env.service,
    workerId: String(process.pid), // use own pid here
    regionId: process.env.REGION_COUNTRY || "local",
  });
});

server.on("close", async () => {
  logger.warn("Server closed");
  await stopReporting();
});
