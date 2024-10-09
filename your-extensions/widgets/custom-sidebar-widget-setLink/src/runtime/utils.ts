import {
  Immutable,
  ImmutableArray,
  ImmutableObject,
  IMPageJson,
  IMState,
  LinkType,
  PageJson,
  PageType,
  React,
} from "jimu-core";
import { LinkTarget, NavigationItem, utils } from "jimu-ui";
import { useSelector } from "react-redux";
const { useState, useEffect, useMemo } = React;

const normalIcon = require("jimu-ui/lib/icons/toc-page.svg");
const linkIcon = require("jimu-ui/lib/icons/toc-link.svg");
const folderIcon = require("jimu-ui/lib/icons/toc-folder.svg");

const icons = {
  [PageType.Normal]: normalIcon,
  [PageType.Link]: linkIcon,
  [PageType.Folder]: folderIcon,
};

interface PageStructureItem {
  [pageId: string]: string[];
}
type IMPageStructure = ImmutableArray<PageStructureItem>;

interface Pages {
  [pageId: string]: PageJson;
}
type IMpages = ImmutableObject<Pages>;

export const useNavigationData = (): NavigationItem[] => {
  const [data, setData] = useState<NavigationItem[]>([]);
  const pages = useSelector((state: IMState) => state?.appConfig?.pages);
  const pageStructure = useSelector(
    (state: IMState) => state?.appConfig?.pageStructure
  );

  useEffect(() => {
    const data = getMenuNavigationData(pageStructure, pages);
    setData(data as any);
  }, [pages, pageStructure]);

  return data;
};

export const getMenuNavigationData = (
  pageStructure: IMPageStructure,
  pages: IMpages
): ImmutableArray<ImmutableObject<NavigationItem>> => {
  pageStructure = filterPageStructure(pageStructure, pages);
  return pageStructure.map((item) => {
    const entries = Object.entries(item)[0];
    const id = entries[0];
    const subs = entries[1];
    const info = pages[id];
    const navItem = getMenuNavigationItem(info);

    const subNavItems = subs.map((subPageId) => {
      const info = pages[subPageId];
      return getMenuNavigationItem(info);
    });
    return navItem.set("subs", subNavItems);
  });
};

export const filterPageStructure = (
  pageStructure: IMPageStructure,
  pages: IMpages
): IMPageStructure => {
  pageStructure = pageStructure.filter((item) => {
    const id = Object.keys(item)[0];
    const info = pages?.[id];
    return info.isVisible;
  });

  return pageStructure.map((item) => {
    const entries = Object.entries(item)[0];
    const id = entries[0];
    let subs = entries[1];
    subs = subs.filter((id) => {
      const info = pages?.[id];
      return info.isVisible;
    });
    return item.set(id, subs) as any;
  });
};

const getMenuNavigationItem = (
  page: IMPageJson
): ImmutableObject<NavigationItem> => {
  const linkType = getLinkType(page);
  const value = getLinkValue(page);
  const icon = page.icon || icons[page.type];

  return Immutable({
    linkType,
    value,
    icon:
      Object.prototype.toString.call(icon) === "[object Object]"
        ? icon
        : utils.toIconResult(icon, page.type, 16),
    target: page.openTarget as LinkTarget,
    name: page.label,
  });
};

const getLinkType = (page: IMPageJson) => {
  if (page.type === PageType.Link) {
    return LinkType.WebAddress;
  } else if (page.type === PageType.Normal) {
    return LinkType.Page;
  } else if (page.type === PageType.Folder) {
    return LinkType.None;
  }
};

const getLinkValue = (page: IMPageJson) => {
  if (page.type === PageType.Link) {
    return page.linkUrl;
  } else if (page.type === PageType.Normal) {
    return page.id;
  } else if (page.type === PageType.Folder) {
    return "#";
  }
};

/**
 * Return a function to check navigation item is actived or not
 */
export const useAvtivePage = () => {
  const currentPageId = useSelector(
    (state: IMState) => state?.appRuntimeInfo?.currentPageId
  );
  return React.useCallback(
    (item: NavigationItem) => {
      return getPageId(item) === currentPageId;
    },
    [currentPageId]
  );
};

/**
 * Get page id from `NavigationItem`
 * @param item
 */
export const getPageId = (item: NavigationItem): string => {
  if (!item?.value) return ''
  const splits = item.value.split(',')
  return splits?.length ? splits[0] : ''
}