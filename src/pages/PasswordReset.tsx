import { getAuthInstance } from "../utils/firestore";
import { confirmPasswordReset } from "firebase/auth";
import { showErrorModal } from "../components/ErrorAlert";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from '@mui/material/TextField';
import { Button } from "@mui/material";
import "../styles/App.css"

function pswdReset(){
    const [NewPassword, UpdateNewPassword] = useState<string>("");
    const [ConfNewPassword, UpdateConfNewPassword] = useState<string>("");

    function passwordReset(){
        

        try{
            if(NewPassword === ConfNewPassword){
                const queryString = window.location.search;
                const queryParams = new URLSearchParams(queryString);
                const oobCode = queryParams.get('oobCode');

                const auth = getAuthInstance();
                confirmPasswordReset(auth, oobCode!, NewPassword)
            }
        }
        catch{
            showErrorModal();
        }
    }

    const HandleNewPasswordUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        UpdateNewPassword(event.target.value);
    };

    const HandleConfNewPasswordUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        UpdateConfNewPassword(event.target.value);
    };

    return(
        <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 3,
        px: 0,
      }}
    >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}></Stack>
            <TextField label="New Password" variant="outlined" onChange={HandleNewPasswordUpdate} value={NewPassword}/>
            <TextField label="Conf New Password" variant="outlined" onChange={HandleConfNewPasswordUpdate} value={ConfNewPassword}/>
            <Button variant="contained"
            color="primary"
            onClick={passwordReset}>
            </Button>
      </Box>
    );
}
export default pswdReset 
