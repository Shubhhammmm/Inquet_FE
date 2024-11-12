import React, { useState, useEffect } from "react";
import axios from "axios";
import socket from "../socket";
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Box,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

// Custom styles for Admin Panel
const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
  },
  paper: {
    padding: "30px",
    maxWidth: "600px",
    textAlign: "center",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    background: "linear-gradient(135deg, #f5f7fa, #cfd8dc)",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "1rem",
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
  buttonGrid: {
    marginTop: "20px",
  },
  scoreButton: {
    fontSize: "1rem",
    padding: "10px 15px",
    minWidth: "50px",
  },
  resetButton: {
    marginTop: "20px",
    backgroundColor: "#e53935",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#c62828",
    },
  },
  loader: {
    color: "#d32f2f",
  },
  noData: {
    color: "#666",
    fontStyle: "italic",
  },
}));

const AdminView = () => {
  const classes = useStyles();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await axios.get(
          "https://inquet-be.onrender.com/api/match/current"
        );

        if (!res.data) {
          console.log("Initializing match...");
          const initRes = await axios.post(
            "https://inquet-be.onrender.com/api/match/initialize"
          );
          setMatch(initRes.data);
        } else {
          setMatch(res.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching match data:", error);
        setLoading(false);
      }
    };

    fetchMatch();

    socket.on("score-updated", (updatedMatch) => {
      setMatch(updatedMatch);
    });

    return () => {
      socket.off("score-updated");
    };
  }, []);

  const handleScoreUpdate = async (run_scored, is_wicket = false) => {
    try {
      await axios.post("https://inquet-be.onrender.com/api/match/ball", {
        run_scored,
        is_wicket,
      });
      socket.emit("score-update");
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  const handleResetMatch = async () => {
    try {
      const res = await axios.post(
        "https://inquet-be.onrender.com/api/match/initialize"
      );
      setMatch(res.data);
      socket.emit("score-update");
    } catch (error) {
      console.error("Error resetting match:", error);
    }
  };

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
          Admin Panel
        </Typography>
        {match ? (
          <>
            <Typography className={classes.score}>
              Score: {match.total_runs}/{match.total_wickets}
            </Typography>
            <Typography className={classes.over}>
              Over: {match.current_over == 0 ? 0 : match.current_over - 1}
              {":"}
              {match.overs[match.overs.length - 1]?.balls.length || 0}
            </Typography>
            <Grid container spacing={2} justifyContent="center" className={classes.buttonGrid}>
              {[0, 1, 2, 3, 4, 6].map((run) => (
                <Grid item key={run}>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.scoreButton}
                    onClick={() => handleScoreUpdate(run)}
                  >
                    {run}
                  </Button>
                </Grid>
              ))}
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  className={classes.scoreButton}
                  onClick={() => handleScoreUpdate(0, true)}
                >
                  Wicket
                </Button>
              </Grid>
            </Grid>
            <Button
              variant="contained"
              className={classes.resetButton}
              onClick={handleResetMatch}
            >
              Reset Match
            </Button>
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

export default AdminView;
