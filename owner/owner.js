const OWNER_LOGIN = "richiefireball";
const RELEASES_PATH = "/repos/RichieFireball/GameFeed-site/releases?per_page=100";
const INSTALLER_NAME = "GameFeed-Setup.exe";

const accessPanel = document.querySelector("[data-access-panel]");
const dashboard = document.querySelector("[data-dashboard]");
const accessForm = document.querySelector("[data-access-form]");
const tokenInput = document.querySelector("[data-token-input]");
const revealTokenButton = document.querySelector("[data-reveal-token]");
const unlockButton = document.querySelector("[data-unlock-button]");
const unlockLabel = document.querySelector("[data-unlock-label]");
const accessStatus = document.querySelector("[data-access-status]");
const dashboardStatus = document.querySelector("[data-dashboard-status]");
const refreshButton = document.querySelector("[data-refresh]");
const lockButton = document.querySelector("[data-lock]");
const releaseRows = document.querySelector("[data-release-rows]");

let ownerToken = null;

const numberFormatter = new Intl.NumberFormat("en-US");
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const setStatus = (element, message, isSuccess = false) => {
  element.textContent = message;
  element.classList.toggle("success", isSuccess);
};

const githubRequest = async (path) => {
  if (!ownerToken) {
    throw new Error("Owner access has expired. Enter your GitHub token again.");
  }

  const response = await fetch(`https://api.github.com${path}`, {
    method: "GET",
    cache: "no-store",
    credentials: "omit",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${ownerToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (response.status === 401) {
    throw new Error("GitHub rejected this token. Check that it is active and try again.");
  }
  if (response.status === 403) {
    throw new Error("GitHub blocked this request. Check the token permissions or try again later.");
  }
  if (!response.ok) {
    throw new Error(`GitHub could not load the dashboard (HTTP ${response.status}).`);
  }

  return response.json();
};

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "--";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const makeCell = (text, className = "") => {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) cell.className = className;
  return cell;
};

const renderReleaseRows = (installers) => {
  releaseRows.replaceChildren();

  installers.forEach(({ release, asset }) => {
    const row = document.createElement("tr");
    const versionCell = document.createElement("td");
    const releaseLink = document.createElement("a");
    const safeReleaseUrl =
      typeof release.html_url === "string" &&
      release.html_url.startsWith("https://github.com/RichieFireball/GameFeed-site/releases/");

    releaseLink.className = "version-link";
    releaseLink.textContent = release.tag_name || "Release";
    if (safeReleaseUrl) {
      releaseLink.href = release.html_url;
      releaseLink.target = "_blank";
      releaseLink.rel = "noopener noreferrer";
    }
    versionCell.append(releaseLink);

    row.append(
      versionCell,
      makeCell(dateFormatter.format(new Date(release.published_at))),
      makeCell(formatBytes(asset.size)),
      makeCell(numberFormatter.format(asset.download_count || 0), "number-cell"),
    );
    releaseRows.append(row);
  });
};

const loadDashboard = async () => {
  refreshButton.disabled = true;
  setStatus(dashboardStatus, "Refreshing download counts...");

  try {
    const releases = await githubRequest(RELEASES_PATH);
    const publicReleases = releases.filter(
      (release) => !release.draft && !release.prerelease && release.published_at,
    );
    const installers = publicReleases.flatMap((release) =>
      release.assets
        .filter((asset) => asset.name === INSTALLER_NAME)
        .map((asset) => ({ release, asset })),
    );

    if (installers.length === 0) {
      throw new Error("No public GameFeed installer assets were found.");
    }

    const totalDownloads = installers.reduce(
      (total, item) => total + (item.asset.download_count || 0),
      0,
    );
    const latest = installers[0];
    const earliest = installers[installers.length - 1].release;

    document.querySelector("[data-total-downloads]").textContent =
      numberFormatter.format(totalDownloads);
    document.querySelector("[data-latest-downloads]").textContent =
      numberFormatter.format(latest.asset.download_count || 0);
    document.querySelector("[data-latest-version]").textContent =
      `${latest.release.tag_name} installer`;
    document.querySelector("[data-release-count]").textContent =
      numberFormatter.format(installers.length);
    document.querySelector("[data-tracking-since]").textContent =
      `Since ${dateFormatter.format(new Date(earliest.published_at))}`;
    document.querySelector("[data-last-updated]").textContent =
      `Updated ${timeFormatter.format(new Date())}`;

    renderReleaseRows(installers);
    setStatus(dashboardStatus, "Counts are up to date.", true);
  } catch (error) {
    setStatus(dashboardStatus, error.message || "Could not refresh download counts.");
  } finally {
    refreshButton.disabled = false;
  }
};

const lockDashboard = () => {
  ownerToken = null;
  accessForm.reset();
  tokenInput.type = "password";
  revealTokenButton.textContent = "Show";
  revealTokenButton.setAttribute("aria-label", "Show token");
  releaseRows.replaceChildren();
  dashboard.hidden = true;
  accessPanel.hidden = false;
  setStatus(accessStatus, "");
  setStatus(dashboardStatus, "");
  tokenInput.focus();
};

accessForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submittedToken = tokenInput.value.trim();
  if (!submittedToken) return;

  ownerToken = submittedToken;
  unlockButton.disabled = true;
  unlockLabel.textContent = "Verifying with GitHub...";
  setStatus(accessStatus, "Checking the authenticated GitHub account...");

  try {
    const user = await githubRequest("/user");
    if (String(user.login || "").toLowerCase() !== OWNER_LOGIN) {
      throw new Error("This GitHub account is not authorized for the GameFeed owner dashboard.");
    }

    document.querySelector("[data-owner-login]").textContent = user.login;
    accessForm.reset();
    await loadDashboard();
    accessPanel.hidden = true;
    dashboard.hidden = false;
  } catch (error) {
    ownerToken = null;
    tokenInput.value = "";
    setStatus(accessStatus, error.message || "Owner verification failed.");
    tokenInput.focus();
  } finally {
    unlockButton.disabled = false;
    unlockLabel.textContent = "Verify and open dashboard";
  }
});

revealTokenButton.addEventListener("click", () => {
  const isHidden = tokenInput.type === "password";
  tokenInput.type = isHidden ? "text" : "password";
  revealTokenButton.textContent = isHidden ? "Hide" : "Show";
  revealTokenButton.setAttribute("aria-label", isHidden ? "Hide token" : "Show token");
  tokenInput.focus();
});

refreshButton.addEventListener("click", loadDashboard);
lockButton.addEventListener("click", lockDashboard);
window.addEventListener("pagehide", () => {
  ownerToken = null;
});
