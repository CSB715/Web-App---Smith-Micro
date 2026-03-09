import { getAuthInstance } from "../utils/firestore";
import { confirmPasswordReset } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Button, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useSearchParams } from "react-router";
import "../styles/App.css";

function pswdReset() {
  const [NewPassword, UpdateNewPassword] = useState<string>("");
  const [ConfNewPassword, UpdateConfNewPassword] = useState<string>("");
  const [IsHidden, updateIsHidden] = useState<boolean>(true);
  const [IsErrant, SetIsErrant] = useState<boolean>(false);
  const [SearchParams] = useSearchParams();
  const [Success, SetSuccess] = useState<boolean>(false);
  const [ErrorText, SetErrorText] = useState<String>("");

  async function passwordReset() {
    try {
      if (NewPassword === ConfNewPassword) {
        const oobCode = SearchParams.get("oobCode");

        const auth = getAuthInstance();
        await confirmPasswordReset(auth, oobCode!, NewPassword);
        SetSuccess(true);
      } else {
        SetIsErrant(true);
        SetErrorText("Input Passwords Do Not Match");
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/expired-action-code":
            SetIsErrant(true);
            SetErrorText("This Password Reset Link Has Expired");
            break;
          case "auth/invalid-action-code":
            SetIsErrant(true);
            SetErrorText("This Password Reset Link is Invalid or Already Used");
            break;
          case "auth/weak-password":
            SetIsErrant(true);
            SetErrorText("New Password Must Be a Minimum of 6 Characters");
            break;
        }
      }
    }
  }

  const HandleNewPasswordUpdate = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    UpdateNewPassword(event.target.value);
    SetIsErrant(false);
  };

  const HandleConfNewPasswordUpdate = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    UpdateConfNewPassword(event.target.value);
    SetIsErrant(false);
  };

  function setIsHidden(value: boolean) {
    updateIsHidden(value);
  }

  return !Success ? (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          py: 3,
          px: 0,
        }}
      >
        <Stack
          direction="column"
          alignItems="center"
          spacing={1}
          sx={{ mb: 1 }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 300,
              letterSpacing: "-0.02em",
              mb: 3,
            }}
          >
            Reset Password
          </Typography>

          <TextField
            label="New Password"
            type={IsHidden ? "password" : "text"}
            variant="outlined"
            onChange={HandleNewPasswordUpdate}
            value={NewPassword}
            error={IsErrant}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setIsHidden(!IsHidden)}
                      edge="end"
                    >
                      {IsHidden ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Confirm Password"
            type={IsHidden ? "password" : "text"}
            variant="outlined"
            onChange={HandleConfNewPasswordUpdate}
            value={ConfNewPassword}
            error={IsErrant}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setIsHidden(!IsHidden)}
                      edge="end"
                    >
                      {IsHidden ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {IsErrant && (
            <>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 200,
                  letterSpacing: "-0.02em",
                  mb: 3,
                  alignItems: "center",
                  fontSize: "1em"
                }}
                color="red"
              >
                {ErrorText}
              </Typography>
            </>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={passwordReset}
            size="medium"
          >
            Submit
          </Button>
        </Stack>
      </Box>
    </>
  ) : (
    <Typography
      variant="h6"
      sx={{
        fontWeight: 300,
        letterSpacing: "-0.02em",
        mb: 3,
      }}
      color="green"
    >
      Password Reset Successful
    </Typography>
  );
}
export default pswdReset;
