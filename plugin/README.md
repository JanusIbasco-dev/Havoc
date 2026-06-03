# Leaderboard Havoc

Paper/Spigot-compatible Java 21 plugin that bridges Havoc SMP PvP leaderboard data to a website REST API.

## Build

```bash
mvn clean package
```

The plugin jar is created at `target/LeaderboardHavoc-1.0.0.jar`.

## Configure

Install the jar in your server `plugins` folder, start the server once, then edit:

```text
plugins/LeaderboardHavoc/config.yml
```

Set `api.base-url`, `api.api-key`, and the endpoint paths to match your website backend.

## API Payloads

All requests are JSON `POST` requests with:

```text
Authorization: Bearer <api-key>
Content-Type: application/json
```

The plugin sends player registration/update data, skin texture details, kill events, death events, and full point sync payloads. Failed requests are persisted locally and retried asynchronously.
