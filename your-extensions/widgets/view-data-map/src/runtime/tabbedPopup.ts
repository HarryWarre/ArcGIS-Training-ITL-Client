// TabbedPopup.ts
export function createTabbedPopup(): HTMLElement {
  // Create the popup content
  const tabbedPopup = document.createElement("div");
  tabbedPopup.id = "tabbed-popup";

  // Create the tabs
  const tabsList = document.createElement("ul");
  tabsList.className = "tabs";

  const tab1 = document.createElement("li");
  tab1.className = "tab";
  tab1.dataset.tab = "tab1";
  tab1.textContent = "Tab 1";
  tabsList.appendChild(tab1);

  const tab2 = document.createElement("li");
  tab2.className = "tab";
  tab2.dataset.tab = "tab2";
  tab2.textContent = "Tab 2";
  tabsList.appendChild(tab2);

  const tab3 = document.createElement("li");
  tab3.className = "tab";
  tab3.dataset.tab = "tab3";
  tab3.textContent = "Tab 3";
  tabsList.appendChild(tab3);

  tabbedPopup.appendChild(tabsList);

  // Create the tab content
  const tabContent1 = document.createElement("div");
  tabContent1.className = "tab-content";
  tabContent1.id = "tab1";
  tabContent1.innerHTML =
    "<h3>Content for Tab 1</h3><p>This is the content for the first tab.</p>";
  tabbedPopup.appendChild(tabContent1);

  const tabContent2 = document.createElement("div");
  tabContent2.className = "tab-content";
  tabContent2.id = "tab2";
  tabContent2.style.display = "none"; // Initially hidden
  tabContent2.innerHTML =
    "<h3>Content for Tab 2</h3><p>This is the content for the second tab.</p>";
  tabbedPopup.appendChild(tabContent2);

  const tabContent3 = document.createElement("div");
  tabContent3.className = "tab-content";
  tabContent3.id = "tab3";
  tabContent3.style.display = "none"; // Initially hidden
  tabContent3.innerHTML =
    "<h3>Content for Tab 3</h3><p>This is the content for the third tab.</p>";
  tabbedPopup.appendChild(tabContent3);

  // Add click event listener for tab switching
  tabsList.addEventListener("click", (event) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.classList.contains("tab")
    ) {
      const activeTab = tabsList.querySelector(".tab.active");
      if (activeTab) {
        activeTab.classList.remove("active");
        document.getElementById(activeTab.dataset.tab!)!.style.display = "none";
      }

      event.target.classList.add("active");
      const contentId = event.target.dataset.tab;
      document.getElementById(contentId!)!.style.display = "block";
    }
  });

  // Set the first tab as active
  tab1.classList.add("active");

  return tabbedPopup;
}
