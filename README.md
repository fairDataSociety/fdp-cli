# Fair Data Protocol CLI

**Warning: This project is in beta state. There might (and most probably will) be changes in the future to its API and working. Also, no guarantees can be made about its stability, efficiency, and security at this stage.**

## Table of Contents

- [Installation](#installation)
  - [npm](#from-npm)
- [Contribute](#contribute)
- [License](#license)

## Installation

### From npm

To install globally (requires `npm root --global` to be writable):

```sh
npm install --global @fairdatasociety/fdp-cli
```

# Development

After the project has been cloned, the dependencies must be
installed. Run the following in the project folder:

```sh
 $ npm ci
```

Then you need to compile the TypeScript code:

```sh
 $ npm run compile
```

To make the local `fdp-cli` files in the `dist/` directory available as a global package:

```sh
 $ npm link
```

If all went well you should be able to run `fdp-cli`.

If `npm link` fails, or you don't want to install anything, then you
can use `node dist/index.js` to run `fdp-cli` from the checked out
directory.

## Contribute

There are some ways you can make this module better:

- Consult our [open issues](https://github.com/fairDataSociety/fdp-cli/issues) and take on one of them
- Help our tests reach 100% coverage!

## License

[BSD-3-Clause](./LICENSE)
