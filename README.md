# Windows Grep CLI

A simple `grep`-style command for Windows written in TypeScript.

## Features

- Recursive file search
- Case-insensitive search with `-i`
- Line numbers with `-n`
- File-name-only output with `-l`
- Fixed string search with `-F`
- Extension filtering with `--ext=.ts,.js`

## Requirements

- Windows
- Node.js

## Install Dependencies

```powershell
npm install
```

## Build

If `npm run build` works in your shell:

```powershell
npm run build
```

If `npm` has issues but dependencies are already installed:

```powershell
.\node_modules\.bin\tsc.cmd
```

## Run

From the project folder:

```powershell
.\grep.cmd "TODO" .
.\grep.cmd -n "function" .\src
.\grep.cmd -i --ext=.ts,.js "hello" .
```

## Usage

```text
grep [options] <pattern> [path]
```

Examples:

```powershell
.\grep.cmd "TODO" .
.\grep.cmd -i "hello world" .\src
.\grep.cmd -n --ext=.ts,.tsx "useEffect" .
.\grep.cmd -l "main" G:\project\grep
```

## How Paths Work

The `[path]` argument is resolved from your current terminal directory.

Example:

- If you are in `G:\project\grep`, then `.` means `G:\project\grep`
- If you are in `G:\project`, then `.` means `G:\project`

You can also pass an absolute path:

```powershell
.\grep.cmd "TODO" G:\project\grep\src
```

## Add To PATH On Windows

If you want to run `grep` from any folder, add this project directory to your Windows `PATH`.

Project path:

```text
G:\project\grep
```

### Temporary for the current PowerShell session

```powershell
$env:PATH += ";G:\project\grep"
```

After that, you can run:

```powershell
grep "TODO" .
```

### Permanently with the Windows UI

1. Open the Start menu and search for `Environment Variables`.
2. Select `Edit the system environment variables`.
3. Click `Environment Variables...`.
4. Under `User variables`, select `Path`, then click `Edit`.
5. Click `New`.
6. Add `G:\project\grep`.
7. Click `OK` on all dialogs.
8. Close and reopen PowerShell or Command Prompt.

Then run:

```powershell
grep "TODO" .
```

### Permanently with PowerShell

This adds the folder to your user-level `PATH`:

```powershell
[Environment]::SetEnvironmentVariable(
  "Path",
  [Environment]::GetEnvironmentVariable("Path", "User") + ";G:\project\grep",
  "User"
)
```

Close and reopen your terminal after running it.

## Notes

- `grep.cmd` is the Windows launcher.
- `dist/grep.js` is the compiled JavaScript output.
- `node_modules/` and `dist/` are ignored by git via `.gitignore`.
