# Fair Data Protocol CLI

**Warning: This project is in beta state. There might (and most probably will) be changes in the future to its API and working. Also, no guarantees can be made about its stability, efficiency, and security at this stage.**

## Table of Contents

- [Installation](#installation)
  - [npm](#from-npm)
- [Usage](#usage)
- [Development](#development)
- [System environment](#system-environment)
- [Contribute](#contribute)
- [License](#license)

## Installation

### From npm

To install globally (requires `npm root --global` to be writable):

```sh
npm install --global @fairdatasociety/fdp-cli
```

## Usage

Create FDP account. The account will only be stored on your device.

```sh
fdp-cli account create ACCOUNT_NAME
```

Make your account portable between devices.

This action will upload the encrypted account to Ethereum Swarm and you will be able to use your username and password to access your account. The username will be registered in ENS. To perform this action, your wallet must be topped up with at least 0.01 token of the current network.

**This action is optional and you can manage your account information without registering.**

```sh
fdp-cli account register YOUR_USERNAME
```

Login to portable account with storing account's seed to local machine.

```sh
fdp-cli account login YOUR_USERNAME
```

# Development

After the project has been cloned, the dependencies must be
installed. Run the following in the project folder:

```sh
npm ci
```

Then you need to compile the TypeScript code:

```sh
npm run compile
```

To make the local `fdp-cli` files in the `dist/` directory available as a global package:

```sh
npm link
```

If all went well you should be able to run `fdp-cli`.

If `npm link` fails, or you don't want to install anything, then you
can use `node dist/index.js` to run `fdp-cli` from the checked out
directory.

## System environment

With specific system environment variables you can alter the behaviour of the CLI

* `BEE_API_URL` - API URL of Bee client
* `BEE_DEBUG_API_URL` - debug API URL of Bee client
* `BEE_POSTAGE_BATCH_ID` - postage batch ID for data uploading. If empty, the first found usable will be used
* `FDP_CLI_CONFIG_FOLDER` - full path to a configuration folder
* `FDP_CLI_CONFIG_FILE` - configuration file name, defaults to config.json

## Contribute

There are some ways you can make this module better:

- Consult our [open issues](https://github.com/fairDataSociety/fdp-cli/issues) and take on one of them
- Help our tests reach 100% coverage!

## License

[BSD-3-Clause](./LICENSE)
