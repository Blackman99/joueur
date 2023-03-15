# Contributing

The Open Source Guides website has a collection of resources for individuals, communities, and companies. These resources help people who want to learn how to run and contribute to open source projects. Contributors and people new to open source alike will find the following guides especially useful:

* [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
* [Building Welcoming Communities](https://opensource.guide/building-community/)

## Get involved

There are many ways to contribute to Sveltepress, and many of them do not involve writing any code. Here's a few ideas to get started:

* Simply start using Joueur by downloading it from [Releases page](https://github.com/Blackman99/joueur/releases)
* Look through the [open issues](https://github.com/Blackman99/joueur/issues). A good starting point would be issues tagged good first issue. Provide workarounds, ask for clarification, or suggest labels. Help triage issues.
* If you find an issue you would like to fix, open a pull request.
* Join [Discord](https://discord.com/invite/SUnF2WxsV5)

### Creating a branch

[Fork the repository](https://github.com/Blackman99/joueur/fork) and create your branch from master. If you've never sent a GitHub pull request before, you can learn how from [this free video series](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github).

## Developing

### Installation

* Make sure you have [PNPM](https://pnpm.io/) and Node > 16 installed
* Run `pnpm install` in the project root

### Lint

Use [Eslint](https://eslint.org/) and [Prettier](https://prettier.io/) to restrict the format of codes.

* If a js or a ts file changed, use eslint to check it. 
* If a svelte file changed, use eslint and prettier to check it.

### Naming convention

* Svelte component filename in `CamelCase`
* js and ts filename in `kebab-case`
* function and variable name in `camelCase`

### Submitting pull requests

* Make sure `pnpm lint` and `pnpm format` ran and no error were found.
* If a version update is considered required. Please also update the CHANGELOG.md

Looking forward to contributions in any forms!