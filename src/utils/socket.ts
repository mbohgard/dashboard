import io from "socket.io-client";

export const socket =
  process.env.NODE_ENV === "production" ? io() : io("http://localhost:8081");
