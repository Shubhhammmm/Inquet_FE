import React, { useState, useEffect } from "react";
import socket from "../socket";
import axios from "axios";
import { Container, Typography, Paper, CircularProgress } from "@mui/material";

const UserView = () => {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const response = await axios.get(
          "https://incquet-be.onrender.com/api/match/current"
        );
        setMatch(response.data);
      } catch (error) {
        console.error("Error fetching match data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchData();

    socket.on("score-updated", (updatedMatch) => {
      setMatch(updatedMatch);
      console.log({ updatedMatch });
    });

    return () => {
      socket.off("score-updated");
    };
  }, []);

  return (
    <Container maxWidth="md" style={{ marginTop: "20px" }}>
      <Paper elevation={3} style={{ padding: "20px", textAlign: "center" }}>
        {loading ? (
          <CircularProgress />
        ) : match ? (
          <>
            <Typography variant="h4" gutterBottom>
              User View
            </Typography>
            <Typography variant="h6">
              Score: {match.total_runs}/{match.total_wickets}
            </Typography>
            <Typography variant="h6">
              Over: {match.current_over == 0 ? 0 : match.current_over - 1}
              {":"}
              {match?.overs[match?.overs.length - 1]?.balls.length || 0}
            </Typography>
          </>
        ) : (
          <Typography variant="h6">No match data available</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default UserView;
