# Havoc SMP Leaderboard

Monorepo for the Havoc SMP leaderboard system.

## Projects

- `plugin/` - Minecraft Paper plugin that sends PvP, player, skin, and points data to the website API.
- `website/` - Next.js website and API for displaying and receiving leaderboard data.

## Quick Start

```bash
cd website
npm install
npm run dev
```

Build the plugin:

```bash
cd plugin
mvn clean package
```

Set the plugin API base URL to your deployed website:

```yaml
api:
  base-url: "https://your-domain.com/api/minecraft"
```
