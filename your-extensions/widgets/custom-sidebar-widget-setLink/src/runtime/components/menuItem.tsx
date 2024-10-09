import React from "react";
import {
  ListItemButton,
  ListItemIcon,
  List,
  Collapse,
  Divider,
} from "../../../../../node_plugin/node_modules/@mui/material";
import {
  ExpandLess,
  ExpandMore,
} from "../../../../../node_plugin/node_modules/@mui/icons-material";
import { Icon, Link, Typography } from "jimu-ui";
import { useAvtivePage } from "../utils";
import { color } from "highcharts";
import { useDispatch } from "react-redux";
import { appActions } from "jimu-core";
import { eSidebar } from "../extension/my-store";
import { useSelector } from "react-redux";
import { IMState } from "jimu-core";
import { isFuzzyFromDsIds } from "jimu-ui/advanced/lib/data-source-selector/utils";

const { useState, useEffect } = React;
// Component con cho từng menu item
const MenuItem = ({
  dispatch,
  item,
  index,
  open,
  // subMenuStates,
  // handleToggleSubMenu,
  openLinkStyle,
  closedLinkStyle,
}) => {
  const [subMenuState, setSubMenuState] = useState<{
    [key: number]: boolean;
  }>({}); // True là mở, false là đóng

  const subMenuStateReceive = useSelector(
    (state: IMState) => state.widgetsState?.[`${eSidebar.storeKey}`]?.submenu
  );
  console.log(subMenuStateReceive);

  useEffect(() => {
    if (subMenuStateReceive) {
      setSubMenuState(subMenuStateReceive);
    }
  }, [subMenuStateReceive]);

  useEffect(() => {
    if (Object.keys(subMenuState).length > 0)
      console.log(Object.keys(subMenuState));
    dispatch(
      appActions.widgetStatePropChange(
        eSidebar.storeKey,
        eSidebar.sectionKey,
        subMenuState
      )
    );
  }, [subMenuState]);

  const handleToggleSubMenu = (index: number) => {
    setSubMenuState((prevStates) => {
      const newStates = {
        ...prevStates,
        [index]: !prevStates[index],
      };

      return newStates;
    });
  };

  const isActivePage = useAvtivePage();
  const isActive = isActivePage(item);
  return (
    <div key={index}>
      <ListItemButton
        onClick={item.subs ? () => handleToggleSubMenu(index) : undefined}>
        <Link
          to={
            item.linkType === "PAGE"
              ? `/experience/0/page/${item.name.replace(/\s+/g, "-")}`
              : item.linkType === "WEB_ADDRESS"
              ? item.value
              : undefined
          }
          style={open ? openLinkStyle : closedLinkStyle}>
          {item.icon && open && (
            <ListItemIcon>
              <Icon icon={item.icon.svg} />
            </ListItemIcon>
          )}

          {item.icon && !open && (
            <ListItemIcon>
              <Icon icon={item.icon.svg} fontSize='small' />
            </ListItemIcon>
          )}
          {open && <span>{item.name}</span>}
        </Link>

        {item.subs && item.subs.length > 0 && open && (
          <ListItemIcon>
            {subMenuState && subMenuState[index] === index ? (
              <ExpandLess />
            ) : (
              <ExpandMore />
            )}
          </ListItemIcon>
        )}
      </ListItemButton>
      {item.subs && item.subs.length > 0 && (
        <Collapse
          in={subMenuState && subMenuState[index] === true}
          timeout='auto'
          unmountOnExit>
          <List>
            {item.subs.map((subItem, subIndex) => (
              <ListItemButton key={subIndex}>
                <Link
                  style={open ? openLinkStyle : closedLinkStyle}
                  to={`/experience/0/page/${subItem.name.replace(
                    /\s+/g,
                    "-"
                  )}`}>
                  {subItem.icon ? <Icon icon={subItem.icon.svg} /> : null}
                  {open ? <span>{subItem.name}</span> : null}
                </Link>
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      )}
    </div>
  );
};

export default MenuItem;
