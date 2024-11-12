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

// Custom styles for enhanced UI
const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(to right, #eceff1, #e0f7fa)",
  },
  paper: {
    padding: "40px",
    maxWidth: "650px",
    textAlign: "center",
    borderRadius: "16px",
    boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: "2.4rem",
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
  buttonGrid: {
    marginTop: "20px",
  },
  scoreButton: {
    fontSize: "1.1rem",
    padding: "12px 18px",
    minWidth: "60px",
    "&:hover": {
      transform: "scale(1.05)",
      transition: "0.2s",
    },
  },
  wicketButton: {
    backgroundColor: "#d32f2f",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#b71c1c",
    },
  },
  resetButton: {
    marginTop: "30px",
    backgroundColor: "#ff7043",
    color: "#fff",
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "#f4511e",
    },
  },
  loader: {
    color: "#1e88e5",
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
      <Paper className={classes.paper}>
        <Typography className={classes.title}>Admin Control Panel</Typography>
        
        {match ? (
          <>
            {/* Score Section */}
            <Box className={classes.scoreContainer}>
              <Typography className={classes.scoreText}>
                {match.total_runs}/{match.total_wickets}
              </Typography>
              <Typography className={classes.overText}>
                Over: {match.current_over == 0 ? 0 : match.current_over - 1}
                {":"}
                {match.overs[match.overs.length - 1]?.balls.length || 0}
              </Typography>
            </Box>
            
            {/* Action Buttons */}
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
                  className={`${classes.scoreButton} ${classes.wicketButton}`}
                  onClick={() => handleScoreUpdate(0, true)}
                >
                  Wicket
                </Button>
              </Grid>
            </Grid>

            {/* Reset Button */}
            <Button
              variant="contained"
              className={classes.resetButton}
              onClick={handleResetMatch}
            >
              Reset Match
            </Button>
          </>
        ) : (
          <Typography className={classes.overText}>
            No match data available
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default AdminView;
