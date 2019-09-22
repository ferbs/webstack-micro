# vendor-avoiding-package dir

This directory contains small-sized vendor code that is Webpack-imported as regular source code. 

There are already too many package dependencies in *frontend-web*. If this repo is to become a useful starter, it's better 
 to make it easy to remove the bloat.

Importing vendor packages in this manner has downsides but keeps clutter out of package.json.   

Packages only used for Demo-related functionality (but not for auth, routing, etc) yet still listed as dependencies in package.json:
* react-markdown    


Packages imported here:
* [Mousetrap](https://www.npmjs.com/package/mousetrap)
