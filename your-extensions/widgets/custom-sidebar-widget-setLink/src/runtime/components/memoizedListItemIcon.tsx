import { React } from "jimu-core";
import { ListItemIcon } from "../../../../../node_plugin/node_modules/@mui/material";
import { Icon } from "jimu-ui";

interface MemoizedListItemIconProps {
  icon: {
    svg: string;
  };
  open: boolean;
}

const MemoizedListItemIcon = React.memo<MemoizedListItemIconProps>(
  ({ icon, open }) => {
    // console.log(open);
    // console.log("ICON CHANGED");
    return (
      <ListItemIcon>
        <Icon icon={icon.svg} fontSize={open ? "default" : "small"} />
      </ListItemIcon>
    );
  }
);

export default MemoizedListItemIcon;
