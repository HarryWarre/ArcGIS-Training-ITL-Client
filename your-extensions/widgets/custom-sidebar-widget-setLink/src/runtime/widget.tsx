import { hooks, React, type AllWidgetProps } from "jimu-core";
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
import MenuItem from "./components/menuItem";
import { NavigationItem } from "jimu-ui";
const drawerWidth = 240;

const { useState, useEffect } = React;
const Widget = (props: AllWidgetProps<IMConfig>) => {
  // State for drawer and sub-menu
  const [open, setOpen] = useState(true);
  const [da1, setD1] = useState(1);
  const [subMenuStates, setSubMenuStates] = useState<{
    [key: number]: boolean;
  }>({});

  const data = useNavigationData(); // gọi hook ở cấp cao nhất
  const [dataPage, setDataPage] = useState<NavigationItem[]>([]);

  useEffect(() => {
    setDataPage(data);
    console.log(data);
  }, [data]);

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

  const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
    }),
  }));

  // Styling a link
  const linkStyle = {
    textDecoration: "none",
    color: "inherit",
    textAlign: "left",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    transition: "width 0.3s ease",
  };

  const closedLinkStyle = {
    ...linkStyle,
    justifyContent: "center", // Center the icon when the drawer is closed
    // width: "50px", // Smaller width for the icon-only view
    whiteSpace: "nowrap", // Prevent text from wrapping
    textAlign: "center",
  };

  const openLinkStyle = {
    ...linkStyle,
    justifyContent: "start", // Regular style when drawer is open
    width: "auto",
  };

  const handleDrawerOpen = () => setOpen(!open);

  return (
    <Drawer
      variant='permanent'
      open={open}
      sx={{
        "& .MuiDrawer-paper": {
          overflow: "visible", // Allow the button to be visible outside the drawer
        },
      }}>
      <DrawerHeader>
        <IconButton
          size='small'
          onClick={handleDrawerOpen}
          style={{
            position: "absolute",
            right: "-10px", // Move the button further to the right
            top: "4%", // Vertically center it
            transform: "translateY(-50%)",
            zIndex: 3, // Ensure it's above the Drawer
            background: "white",
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

      <Divider />
      <List>
        {Array.isArray(dataPage) && dataPage.length > 0 ? (
          dataPage.map((item, index) => (
            <MenuItem
              dispatch={props.dispatch}
              key={index}
              item={item}
              index={index}
              open={open}
              // subMenuStates={subMenuStates}
              // handleToggleSubMenu={handleToggleSubMenu}
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
    </Drawer>
  );
};

export default Widget;
