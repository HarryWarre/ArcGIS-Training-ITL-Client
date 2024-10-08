import { React, type AllWidgetProps } from "jimu-core";
import { type IMConfig } from "../config";
import {
  MenuItem,
  Paper,
  MenuList,
  Typography,
  Collapse,
  ListItemIcon,
} from "../../../../node_plugin/node_modules/@mui/material";
import { Icon, Link } from "jimu-ui";
import { useNavigationData } from "./utils";
import ExpandLess from "../../../../node_plugin/node_modules/@mui/icons-material/ExpandLess";
import ExpandMore from "../../../../node_plugin/node_modules/@mui/icons-material/ExpandMore";
// Note
/**
 *
 * 1. Một navbar có chiều dài kéo dài xuống dưới hết màn hình
 * 2. Thực hiện Mini variant drawer để thu gọn và expand
 * 3. Xử lý vấn đề về collapse trong sidebar
 * 4. Xử lý đọc folder trong sidebar
 */
const Widget = (props: AllWidgetProps<IMConfig>) => {
  const data = useNavigationData();
  console.log(data);
  const { useState } = React;
  // State sub-menu
  const [openSubMenus, setOpenSubMenus] = useState<{
    [key: number]: boolean;
  }>({});

  const handleToggleSubMenu = (index: number) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderLink = (item) => {
    switch (item.linkType) {
      case "PAGE":
        return (
          <Link
            to={`/experience/0/page/${item.name.replace(/\s+/g, "-")}`} // item.value or name (name will go with .replace(/\s+/g, "-") )
            style={{
              textDecoration: "none",
              color: "inherit",
              textAlign: "left",
              padding: "10px",
            }}>
            {item.icon ? <Icon icon={item.icon.svg} /> : null}
            {item.name}
          </Link>
        );
      case "WEB_ADDRESS":
        return (
          <Link
            to={item.value} // item.value or name (name will go with .replace(/\s+/g, "-") )
            style={{
              textDecoration: "none",
              color: "inherit",
              textAlign: "left",
              padding: "10px",
            }}>
            {item.icon ? <Icon icon={item.icon.svg} /> : null}
            {item.name}
          </Link>
        );
      default:
        return (
          <Link
            style={{
              textDecoration: "none",
              color: "inherit",
              textAlign: "left",
              padding: "10px",
            }}>
            {item.icon ? <Icon icon={item.icon.svg} /> : null}
            {item.name}
          </Link>
        );
    }
  };

  return (
    <Paper sx={{ width: "300px", maxWidth: "100%" }}>
      <MenuList sx={{ display: "flex", flexDirection: "column" }}>
        {Array.isArray(data) && data.length > 0 ? (
          data.map((item, index) => (
            <div key={index}>
              <MenuItem
                focusRipple={false}
                onClick={
                  item.subs ? () => handleToggleSubMenu(index) : undefined
                } // Toggle sub-menu
              >
                {renderLink(item)}
                {/* {item.subs &&
                  item.subs.length > 0 &&
                  (openSubMenus[index] ? <ExpandLess /> : <ExpandMore />)} */}
                {item.subs &&
                  item.subs.length > 0 &&
                  (openSubMenus[index] ? (
                    <ListItemIcon onClick={() => openSubMenus[index]}>
                      <ExpandLess />
                    </ListItemIcon>
                  ) : (
                    <ListItemIcon onClick={() => openSubMenus[index]}>
                      <ExpandMore />
                    </ListItemIcon>
                  ))}
              </MenuItem>
              {item.subs &&
                item.subs.length > 0 && ( // Check sub menu
                  <Collapse
                    in={openSubMenus[index]}
                    timeout='auto'
                    unmountOnExit>
                    <MenuList sx={{ marginLeft: "15px" }}>
                      {item.subs.map((subItem, subIndex) => (
                        <MenuItem key={subIndex}>
                          <Link
                            style={{
                              textDecoration: "none",
                              color: "inherit",
                              textAlign: "left",
                              padding: "10px",
                            }}
                            to={`/experience/0/page/${subItem.name.replace(
                              /\s+/g,
                              "-"
                            )}`}>
                            <ListItemIcon>
                              {subItem.icon ? (
                                <Icon icon={subItem.icon.svg} />
                              ) : null}
                            </ListItemIcon>
                            {subItem.name}
                          </Link>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Collapse>
                )}
            </div>
          ))
        ) : (
          <Typography
            variant='body2'
            sx={{ padding: "10px", textAlign: "center" }}></Typography>
        )}
      </MenuList>
    </Paper>
  );
};

export default Widget;
