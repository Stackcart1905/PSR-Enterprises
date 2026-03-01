import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

let socket = null;

/**
 * Initialize or return the existing singleton socket connection.
 * Requires a JWT token for authentication.
 */
export const getSocket = () => {
    if (socket && socket.connected) return socket;

    const token = localStorage.getItem("token");
    if (!token) return null;

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 10,
    });

    socket.on("connect", () => {
        console.log("🔌 Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
        console.error("🔌 Socket connection error:", err.message);
    });

    return socket;
};

/**
 * Disconnect and clean up socket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export default getSocket;
