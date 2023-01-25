import React from "react";
import { AppBar, Box, Toolbar, Button } from "@mui/material";

const MenuAppBar = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Button href="/" color="inherit">
            Home
          </Button>
          <Button href="/grouping" color="inherit">
            Grouping
          </Button>
          <Button href="/filtering" color="inherit">
            Filtering
          </Button>
          <Button href="/sorting" color="inherit">
            Sorting
          </Button>
          <Button href="/subline" color="inherit">
            Subline
          </Button>
          <Button href="/editing" color="inherit">
            Editing
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default MenuAppBar;