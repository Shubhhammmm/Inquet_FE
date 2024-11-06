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
} from "@mui/material";

const AdminView = () => {
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

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="md" style={{ marginTop: "20px" }}>
      <Paper elevation={3} style={{ padding: "20px" }}>
        <Typography variant="h4" align="center" gutterBottom>
          Admin Panel
        </Typography>
        {match ? (
          <>
            <Typography variant="h6" align="center">
              Score: {match.total_runs}/{match.total_wickets}
            </Typography>
            <Typography variant="h6" align="center">
              Over: {match.current_over == 0 ? 0 : match.current_over - 1}
              {":"}
              {match.overs[match.overs.length - 1]?.balls.length || 0}
            </Typography>
            <Grid
              container
              spacing={2}
              justifyContent="center"
              style={{ marginTop: "20px" }}
            >
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleScoreUpdate(0)}
                >
                  0
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleScoreUpdate(1)}
                >
                  1
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleScoreUpdate(2)}
                >
                  2
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleScoreUpdate(3)}
                >
                  3
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleScoreUpdate(4)}
                >
                  4
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleScoreUpdate(6)}
                >
                  6
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleScoreUpdate(0, true)}
                >
                  Wicket
                </Button>
              </Grid>
              {/* <Grid item>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleResetMatch}
                >
                  Reset Match
                </Button>
              </Grid> */}
            </Grid>
          </>
        ) : (
          <Typography variant="h6" align="center">
            No match data available
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default AdminView;
