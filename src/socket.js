import io from "socket.io-client";

const socket = io.connect("https://inquet-be.onrender.com");

export default socket;
