# remix-routes-folder

A Remix plugin that allows you to organize your routes in multiple route-folders.

Each route-folder can be hosted on a different URL path.

> Note: This package only works Remix's V2 flat-routes convention. If you want to use similar feature for V1 routing convention, please use [remix-mount-routes](https://www.npmjs.com/package/remix-mount-routes).

## Installation

```bash
npm install remix-routes-folder
```

## Usage

If we want to create a routes-folder for the admin section, we can do the following:

1. Create a folder named `admin-routes` (or any other name) in the `app` (appDirectory) folder.
1. Add a `__root.tsx` (or `.jsx`) file in the `admin-routes` folder. This file will be the root layout of the admin section.
   - The `__root` file should render the `Outlet` component.
1. Update the `remix.config.js` file to use the `addRoutesFolder` function and add `admin-routes` routes-folder to the `/admin` path.
1. Add your flat routes files in the `admin-routes` folder, in accordance with [Remix flat-routes conventions](https://remix.run/docs/en/main/file-conventions/route-files-v2).

```js
// remix.config.js
const { addRoutesFolder } = require("remix-routes-folder");

module.exports = {
  routes: (defineRoutes) => {
    // Create a route-folder for the admin section.
    const adminRoutes = addRoutesFolder("admin-routes", { urlPath: "admin" });
    // Add your other routes here
    const otherRoutes = defineRoutes((route) => {
      route("/somewhere/cool/*", "catchall.tsx");
    });

    return { ...adminRoutes, ...otherRoutes };
  },
};
```

## API

The `addRoutesFolder` function takes two arguments:

- `routesFolder`: The name of the folder that contains the routes files relative to appDirectory.
- `options`: An object that contains the following properties:
  - `urlPath`: URL path to mount the directory to. If left undefined, the directory name will be used.
  - `appDirectory`: Remix's app directory relative to config file. @default "app"
  - `ignoredRouteFiles`: Glob patterns for files to ignore when generating routes.

```ts
export declare function addRoutesFolder(
  routesFolder: string,
  options?: AddRoutesFolderOptions
): RouteManifest;

export interface AddRoutesFolderOptions {
  /** URL path to mount the directory to. If left undefined, the directory name will be used. */
  urlPath?: string;
  /** Remix's app directory relative to config file. @default app */
  appDirectory?: string;
  /** Glob patterns for files to ignore when generating routes. */
  ignoredRouteFiles?: string[];
}
```

## License

MIT

## Author

[Siddhant Gupta](https://guptasiddhant.com)
