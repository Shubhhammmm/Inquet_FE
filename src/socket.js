import io from "socket.io-client";

const socket = io.connect("https://incquet-be.onrender.com");

export default socket;
