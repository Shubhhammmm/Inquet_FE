import React, { useState, useEffect } from "react";
import socket from "../socket";
import axios from "axios";
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Box,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

// Custom styles for enhanced UI
const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
  },
  paper: {
    padding: "30px",
    textAlign: "center",
    maxWidth: "600px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
  },
  title: {
    fontSize: "2rem",
    color: "#333",
    marginBottom: "1rem",
    fontWeight: "bold",
  },
  score: {
    fontSize: "1.8rem",
    color: "#d32f2f",
    fontWeight: "bold",
  },
  over: {
    fontSize: "1.2rem",
    color: "#1976d2",
  },
  loader: {
    color: "#d32f2f",
  },
  noData: {
    color: "#666",
    fontStyle: "italic",
  },
}));

const UserView = () => {
  const classes = useStyles();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const response = await axios.get(
          "https://inquet-be.onrender.com/api/match/current"
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
    <Container className={classes.container}>
      <Paper className={classes.paper} elevation={4}>
        {loading ? (
          <CircularProgress className={classes.loader} />
        ) : match ? (
          <>
            <Typography className={classes.title} variant="h4">
              Live Match Score
            </Typography>
            <Typography className={classes.score}>
              Score: {match.total_runs}/{match.total_wickets}
            </Typography>
            <Typography className={classes.over}>
              Over: {match.current_over == 0 ? 0 : match.current_over - 1}
              {":"}
              {match?.overs[match?.overs.length - 1]?.balls.length || 0}
            </Typography>
          </>
        ) : (
          <Typography className={classes.noData} variant="h6">
            No match data available
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default UserView;
