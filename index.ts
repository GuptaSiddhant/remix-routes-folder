import fg from "fast-glob";
import fs from "node:fs";
import path from "node:path";

import { flatRoutesUniversal } from "@remix-run/dev/dist/config/flat-routes";
import type {
  ConfigRoute,
  RouteManifest,
} from "@remix-run/dev/dist/config/routes";
import { routeModuleExts } from "@remix-run/dev/dist/config/routesConvention";

export interface AddRoutesFolderOptions {
  /** URL path to mount the directory to. If left undefined, the directory name will be used. */
  urlPath?: string;
  /** Remix's app directory relative to config file. @default app */
  appDirectory?: string;
  /** Glob patterns for files to ignore when generating routes. */
  ignoredRouteFiles?: string[];
}

export function addRoutesFolder(
  routesFolder: string,
  options: AddRoutesFolderOptions = {},
): RouteManifest {
  const {
    urlPath = routesFolder,
    appDirectory = "app",
    ignoredRouteFiles,
  } = options;
  const routesDirPath = generateRoutesDirPath(routesFolder, appDirectory);
  const routePaths = generateRoutePaths(routesDirPath, ignoredRouteFiles);
  const rootFilePath = generateRootFilePath(
    appDirectory,
    routesFolder,
    routePaths,
  );

  return generateFlatRoutes(
    routesFolder,
    rootFilePath,
    urlPath,
    routePaths,
    appDirectory,
  );
}

const ROOT_LAYOUT_FILE = "__root";

function generateRoutesDirPath(
  routesFolder: string,
  appDirectory: string = "app",
) {
  const currentDir = process.cwd();
  const appDirPth = path.resolve(currentDir, appDirectory);
  const routesDirPath = path.join(appDirPth, routesFolder);
  if (!fs.existsSync(routesDirPath)) {
    throw new Error(`Directory "${routesDirPath}" does not exist.`);
  }
  return routesDirPath;
}

function generateRootFilePath(
  appDirectory: string,
  routesFolder: string,
  routePaths: string[],
) {
  const rootFile = routePaths.find((routePath) =>
    routePath.includes(path.join(routesFolder, ROOT_LAYOUT_FILE)),
  );

  if (!rootFile) {
    throw new Error(
      `Directory "${routesFolder}" does not contain a "${ROOT_LAYOUT_FILE}" file. The root file should contain <Outlet/>.`,
    );
  }

  return rootFile.slice(appDirectory.length + 1);
}

function generateRoutePaths(
  routesDirPath: string,
  ignoredRouteFiles: string[] = ["**/.*"],
) {
  const extensions = routeModuleExts.join(",");
  const routePaths = fg
    .sync(`**/*{${extensions}}`, {
      absolute: true,
      cwd: routesDirPath,
      ignore: ignoredRouteFiles,
      onlyFiles: true,
    })
    .map((routePath) => path.normalize(routePath));

  // Remove the current working directory from the route paths
  return routePaths.map((routePath) =>
    routePath.slice(process.cwd().length + 1),
  );
}

function generateFlatRoutes(
  routesDir: string,
  rootFilePath: string,
  urlPath: string,
  routePaths: string[],
  appDirectory: string,
) {
  const flatRoutes = flatRoutesUniversal(appDirectory, routePaths, routesDir);

  for (const routeId in flatRoutes) {
    const configRoute = flatRoutes[routeId];
    if (configRoute.parentId === "root") {
      configRoute.parentId = routesDir;
    }
    if (configRoute.file.includes(ROOT_LAYOUT_FILE)) {
      // rome-ignore lint/performance/noDelete: The __root file is used in parent
      delete flatRoutes[routeId];
    }
  }

  const rootConfigRoute: ConfigRoute = {
    file: rootFilePath,
    id: routesDir,
    index: false,
    caseSensitive: false,
    parentId: "root",
    path: urlPath,
  };

  flatRoutes[routesDir] = rootConfigRoute;

  return flatRoutes;
}
