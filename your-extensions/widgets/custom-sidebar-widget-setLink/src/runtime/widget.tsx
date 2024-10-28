import { appActions, hooks, React, type AllWidgetProps } from "jimu-core";
import { type IMConfig } from "../config";
import {
  Typography,
  List,
  IconButton,
  Divider,
} from "../../../../node_plugin/node_modules/@mui/material";
import MuiDrawer from "../../../../node_plugin/node_modules/@mui/material/Drawer";
import { useNavigationData } from "./utils";
import ChevronLeftIcon from "../../../../node_plugin/node_modules/@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "../../../../node_plugin/node_modules/@mui/icons-material/ChevronRight";
import {
  styled,
  Theme,
  CSSObject,
} from "../../../../node_plugin/node_modules/@mui/material/styles";
import MenuItems from "./components/menuItem";
import { eMenuSidebar } from "./extension/my-store";
import { useSelector } from "react-redux";
import { IMState } from "jimu-core";
const drawerWidth = 300;

const { useState, useEffect } = React;
const Widget = (props: AllWidgetProps<IMConfig>) => {
  const data = useNavigationData();

  const open = useSelector((state: IMState) => {
    const menuState = state.widgetsState?.[`${eMenuSidebar.storeKey}`]?.menu;
    return menuState !== undefined ? menuState : true; // Default to true only if undefined
  });

  // Function toggle state drawer, send new state into Redux
  const handleDrawerOpen = () => {
    props.dispatch(
      appActions.widgetStatePropChange(
        eMenuSidebar.storeKey,
        eMenuSidebar.sectionMenuKey,
        !open
      )
    );
  };

  // Get Data Menu
  const isInSmallDevice = hooks.useCheckSmallBrowserSizeMode();

  // Styling a drawyer
  const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
  });

  const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(10)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
      width: `calc(${theme.spacing(9)} + 1px)`,
    },
  });

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  }));

  const DrawerBody = styled("div")(({ theme }) => ({
    ...theme.mixins.toolbar,
  }));

  const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    backgroundColor: "red",
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
      backgroundColor: "grey",
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
      backgroundColor: "grey",
    }),
  }));

  // Styling a link
  const linkStyle = {
    textDecoration: "none",
    color: "inherit",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    transition: "width 0.5s ease",
  };

  const closedLinkStyle = {
    ...linkStyle,
    justifyContent: "center", // Center the icon when the drawer is closed
    // width: "50px",
    padding: "10px",
    whiteSpace: "nowrap", // Prevent text from wrapping
    textAlign: "center",
  };

  const openLinkStyle = {
    ...linkStyle,
    justifyContent: "start", // Regular style when drawer is open
    width: "auto",
  };

  return (
    <Drawer
      anchor='left'
      variant='permanent'
      open={open}
      sx={{
        "& .MuiDrawer-paper": {
          overflow: "visible",
        },
      }}>
      <DrawerHeader sx={{ position: "sticky", zIndex: 3 }}>
        <IconButton
          size='small'
          onClick={handleDrawerOpen}
          style={{
            position: "absolute",
            right: "-15px", // Move the button further to the right
            marginTop: "30px",
            transform: "translateY(-50%)",
            zIndex: 3, // Ensure it's above the Drawer
            background: "white",
            border: "0.5px solid lightgrey",
          }}>
          {!isInSmallDevice ? (
            !open ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )
          ) : null}
        </IconButton>
      </DrawerHeader>

      <DrawerBody sx={{ position: "sticky", zIndex: 3 }}>
        <Divider />

        <List
          sx={{
            maxHeight: "100vh",
            overflowY: "auto", // Enable vertical scroll
            overflowX: "hidden", // Unenable horizontal scroll
          }}>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((item, index) => (
              <MenuItems
                dispatch={props.dispatch}
                item={item}
                index={index}
                openLinkStyle={openLinkStyle}
                closedLinkStyle={closedLinkStyle}
              />
            ))
          ) : (
            <Typography
              variant='body2'
              sx={{ padding: "10px", textAlign: "center" }}></Typography>
          )}
        </List>
      </DrawerBody>
    </Drawer>
  );
};

export default Widget;
