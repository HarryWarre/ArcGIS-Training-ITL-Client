import {
  getAppStore,
  IMPageJson,
  React,
  UrlParameters,
  urlUtils,
  type AllWidgetProps,
} from "jimu-core";
import { type IMConfig } from "../config";
import {
  Drawer,
  List,
  MenuItem,
  Divider,
  Paper,
  MenuList,
} from "../../../../node_plugin/node_modules/@mui/material";

const { useState, useEffect } = React;

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const [pages, setPages] = useState<IMPageJson[]>([]);

  // Lấy danh sách các trang từ store
  const fetchPages = () => {
    const appState = getAppStore().getState();
    const allPages = Object.values(appState?.appConfig?.pages);

    if (allPages) {
      setPages(allPages);
      console.log(allPages); // =>> JSON
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handlePageClick = (pageId: string) => {
    // Kiểm tra thuộc tính có sẵn trong urlUtils
    window.location.href = urlUtils.getPageLinkUrl((pageId = pageId));
  };

  return (
    <Paper sx={{ width: "250px", maxWidth: "100%" }}>
      <MenuList>
        {pages.map((page, index) => (
          <MenuItem key={index} onClick={() => handlePageClick(page.label)}>
            {page.label || `Page ${index + 1}`}
          </MenuItem>
        ))}
      </MenuList>
    </Paper>
  );
};

export default Widget;
