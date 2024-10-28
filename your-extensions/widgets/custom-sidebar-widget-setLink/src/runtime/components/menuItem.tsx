import React from "react";
import {
  ListItemButton,
  ListItemIcon,
  List,
  Collapse,
  Box,
} from "../../../../../node_plugin/node_modules/@mui/material";
import Menu, {
  MenuProps,
} from "../../../../../node_plugin/node_modules/@mui/material/Menu";
import {
  styled,
  alpha,
} from "../../../../../node_plugin/node_modules/@mui/material/styles";
import MenuItem from "../../../../../node_plugin/node_modules/@mui/material/MenuItem";
import { Icon, Link } from "jimu-ui";
import { appActions } from "jimu-core";
import { eMenuSidebar, eSidebar } from "../extension/my-store";
import { useSelector } from "react-redux";
import { IMState } from "jimu-core";
import KeyboardArrowDownIcon from "../../../../../node_plugin/node_modules/@mui/icons-material/KeyboardArrowDown";
import ChevronRightIcon from "../../../../../node_plugin/node_modules/@mui/icons-material/ChevronRight";
const { useState, useEffect } = React;

// Component children for each menu items
const MenuItems = ({
  dispatch,
  item,
  index,
  openLinkStyle,
  closedLinkStyle,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // Selector get state menu is open
  const open = useSelector((state: IMState) => {
    const menuState = state.widgetsState?.[`${eMenuSidebar.storeKey}`]?.menu;
    return menuState !== undefined ? menuState : true; // Default to true only if undefined
  });

  // Current Page selector
  const currentPage = useSelector((state: IMState) => {
    return state.appRuntimeInfo.currentPageId; // Default to true only if undefined
  });

  // state submenu from Redux
  const subMenuState = useSelector(
    (state: IMState) =>
      state.widgetsState?.[`${eSidebar.storeKey}`]?.submenu || {}
  );

  // Function check current Page
  const checkCurrentPage = (idPage) => {
    return idPage === currentPage;
  };

  // Function toggle submenu use dispatch to change state submenu
  const handleToggleSubMenu = (index: number) => {
    if (open) {
      const updatedSubMenuState = {
        ...subMenuState,
        [index]: !subMenuState[index], // Confirm atr: index existed
      };

      dispatch(
        appActions.widgetStatePropChange(
          eSidebar.storeKey,
          eSidebar.sectionKey,
          updatedSubMenuState
        )
      );
    }
  };

  // Toggle handle open and close for sub menu in closed styled
  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Styling sub menu in closed menu
  const StyledMenu = styled((props: MenuProps) => (
    <Menu
      elevation={0}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      {...props}
    />
  ))(({ theme }) => ({
    "& .MuiPaper-root": {
      borderRadius: 4,
      marginTop: theme.spacing(0),
      minWidth: 180,
      maxHeight: 300,
      overflowY: "auto",
      color: "rgb(55, 65, 81)",
      boxShadow:
        "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
      "& .MuiMenuItem-root": {
        "& .MuiSvgIcon-root": {
          fontSize: 18,
          color: theme.palette.text.secondary,
        },
        "&:active": {
          backgroundColor: alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity
          ),
        },
      },
      ...theme.applyStyles("dark", {
        color: theme.palette.grey[300],
      }),
    },
  }));

  return (
    <div key={index}>
      <ListItemButton
        onMouseEnter={
          item.subs
            ? (event) => {
                if (!open) {
                  handleMouseEnter(event);
                }
              }
            : undefined
        }
        onClick={
          item.subs
            ? (event) => (open ? handleToggleSubMenu(index) : undefined)
            : undefined
        }>
        <Link
          to={
            item.linkType === "PAGE"
              ? `/experience/0/page/${item.name.replace(/\s+/g, "-")}`
              : item.linkType === "WEB_ADDRESS"
              ? item.value
              : undefined
          }
          style={open ? openLinkStyle : closedLinkStyle}>
          <ListItemIcon>
            <Icon icon={item.icon.svg} fontSize={open ? "default" : "small"} />
          </ListItemIcon>
          {open && <span>{item.name}</span>}
        </Link>

        {item.subs && item.subs.length > 0 && (
          <ListItemIcon>
            {subMenuState && subMenuState[index] === true ? (
              <KeyboardArrowDownIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </ListItemIcon>
        )}
      </ListItemButton>

      <StyledMenu
        id='demo-customized-menu'
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleClose}
        onMouseLeave={handleClose}>
        {item.subs.map((subItem, subIndex) => (
          <Box key={subIndex} sx={{ width: "100%" }}>
            <MenuItem
              style={{
                textAlign: "start",
                textDecoration: "none",
                color: "grey",
                width: "95%",
                padding: "10px 10px",
                borderRadius: "10px",
              }}
              onClick={handleClose}
              component={Link}
              to={`/experience/0/page/${subItem.name.replace(/\s+/g, "-")}`}
              sx={{
                margin: "5px",
                "&:hover": {
                  backgroundColor: "grey.200",
                },
              }}>
              {subItem.name}
            </MenuItem>
          </Box>
        ))}
      </StyledMenu>

      {open && item.subs && item.subs.length > 0 && (
        <Collapse
          in={subMenuState && subMenuState[index] === true}
          timeout='auto'
          unmountOnExit>
          <List>
            {item.subs.map((subItem, subIndex) => (
              <ListItemButton
                sx={{
                  borderRadius: "10px",
                  margin: "20px",
                  color:
                    open && checkCurrentPage(subItem.value)
                      ? "#00A76F"
                      : "grey",
                  backgroundColor:
                    open && checkCurrentPage(subItem.value)
                      ? "#8aeaca"
                      : "transparent",
                  "&:hover": {
                    backgroundColor:
                      open && checkCurrentPage(subItem.value)
                        ? "#8ae3c2"
                        : "#grey",
                    color:
                      open && checkCurrentPage(subItem.value)
                        ? "8aeaca"
                        : "grey[200]",
                  },
                }}
                key={subIndex}>
                {open ? (
                  <Link
                    style={openLinkStyle}
                    to={`/experience/0/page/${subItem.name.replace(
                      /\s+/g,
                      "-"
                    )}`}>
                    {open ? (
                      <span style={{ marginLeft: "10px" }}>{subItem.name}</span>
                    ) : null}
                  </Link>
                ) : null}
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      )}
    </div>
  );
};

export default MenuItems;
