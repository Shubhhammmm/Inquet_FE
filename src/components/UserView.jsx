import React, { useState, useEffect } from "react";
import axios from "axios";
import socket from "../socket";
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Box,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

// Custom styles for enhanced UserView UI
const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(to right, #f1f8e9, #c8e6c9)",
  },
  paper: {
    padding: "40px",
    maxWidth: "600px",
    textAlign: "center",
    borderRadius: "16px",
    boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: "600",
    color: "#424242",
    marginBottom: "20px",
  },
  scoreContainer: {
    background: "#e3f2fd",
    borderRadius: "8px",
    padding: "20px",
    margin: "20px 0",
  },
  scoreText: {
    fontSize: "2.2rem",
    color: "#1e88e5",
    fontWeight: "bold",
  },
  overText: {
    fontSize: "1.2rem",
    color: "#1976d2",
  },
  loader: {
    color: "#1e88e5",
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

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress className={classes.loader} />
      </Box>
    );

  return (
    <Container className={classes.container}>
      <Paper className={classes.paper} elevation={4}>
        <Typography className={classes.title} variant="h4">
          User View
        </Typography>
        
        {match ? (
          <Box className={classes.scoreContainer}>
            {/* Score Display */}
            <Typography className={classes.scoreText}>
              {match.total_runs}/{match.total_wickets}
            </Typography>
            {/* Over Display */}
            <Typography className={classes.overText}>
              Over: {match.current_over === 0 ? 0 : match.current_over - 1}
              {":"}
              {match?.overs[match?.overs.length - 1]?.balls.length || 0}
            </Typography>
          </Box>
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
