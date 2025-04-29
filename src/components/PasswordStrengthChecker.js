"use client";
import React, { useEffect, useState } from "react";
import zxcvbn from "zxcvbn";
import { TextField, LinearProgress, Box, Typography } from "@mui/material";

const PasswordStrengthChecker = ({ password }) => {
  const [strength, setStrength] = useState(0);

  // Password strength feedback
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "#d32f2f",
    "#f57c00",
    "#fbc02d",
    "#388e3c",
    "#2e7d32",
  ];

  const handlePasswordChange = (pass) => {
    const value = pass;

    // Use zxcvbn to evaluate password strength
    const result = zxcvbn(value);
    setStrength(result.score);
  };

  useEffect(() => {
    handlePasswordChange(password);
  }, [password]);

  return (
    <Box sx={{ minWidth: 250, maxWidth: 300, textAlign: "center" }}>
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="body2"
          sx={{ mt: 1, color: strengthColors[strength], textAlign: "end" }}
        >
          {strengthLabels[strength]}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(strength / 4) * 100}
          sx={{
            height: 5,
            borderRadius: 5,
            backgroundColor: "#e0e0e0",
            "& .MuiLinearProgress-bar": {
              backgroundColor: strengthColors[strength],
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default PasswordStrengthChecker;
