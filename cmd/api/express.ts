import express, { type Request, type Response } from "express";
import { webhandler } from "./server";
import { Context } from "effect";
import { LegacyCurrentUser, User } from "./spec";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello, world!" });
});

const { handler } = webhandler;

// Translation layer: Express Request/Response -> Web API Request/Response
app.use(async (req, res) => {
  // Build the full URL
  const protocol = req.protocol;
  const host = req.get("host");
  const url = `${protocol}://${host}${req.originalUrl}`;

  // Create Web API Request from Express request
  const webRequest = new Request(url, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: ["GET", "HEAD"].includes(req.method)
      ? undefined
      : JSON.stringify(req.body),
  });

  // Call the Effect handler
  const webResponse = await handler(
    webRequest,
    Context.empty().pipe(
      Context.add(
        LegacyCurrentUser,

        // This could get pulled from req.user via Express session middleware
        new User({ id: "123", name: "Legacy User" }),
      ),
    ),
  );

  // Translate Web API Response back to Express response
  res.status(webResponse.status);

  // Copy headers
  webResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  // Send body
  const body = await webResponse.text();
  res.send(body);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
