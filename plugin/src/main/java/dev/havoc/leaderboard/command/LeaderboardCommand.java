package dev.havoc.leaderboard.command;

import dev.havoc.leaderboard.LeaderboardHavocPlugin;
import dev.havoc.leaderboard.model.PlayerRecord;
import dev.havoc.leaderboard.model.PlatformData;
import dev.havoc.leaderboard.model.SkinData;
import dev.havoc.leaderboard.platform.PlatformService;
import dev.havoc.leaderboard.skin.SkinService;
import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.ArrayList;
import java.util.List;

public final class LeaderboardCommand implements CommandExecutor, TabCompleter {
    private final LeaderboardHavocPlugin plugin;

    public LeaderboardCommand(LeaderboardHavocPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, String[] args) {
        if (!sender.hasPermission("leaderboardhavoc.admin")) {
            sender.sendMessage("You do not have permission to use this command.");
            return true;
        }

        if (args.length == 0) {
            sender.sendMessage("Usage: /" + label + " reload|sync|points|refreshskin [player]");
            return true;
        }

        switch (args[0].toLowerCase()) {
            case "reload" -> {
                plugin.reloadServices();
                sender.sendMessage("Leaderboard Havoc configuration reloaded.");
            }
            case "sync" -> {
                List<PlayerRecord> records = plugin.dataStore().allPlayers();
                plugin.apiClient().syncLeaderboard(records);
                sender.sendMessage("Queued leaderboard sync for " + records.size() + " player(s).");
            }
            case "points" -> showPoints(sender, args);
            case "refreshskin" -> refreshSkin(sender, args);
            default -> sender.sendMessage("Usage: /" + label + " reload|sync|points|refreshskin [player]");
        }
        return true;
    }

    @Override
    public @Nullable List<String> onTabComplete(
            @NotNull CommandSender sender,
            @NotNull Command command,
            @NotNull String label,
            String[] args
    ) {
        if (!sender.hasPermission("leaderboardhavoc.admin")) {
            return List.of();
        }

        if (args.length == 1) {
            return List.of("reload", "sync", "points", "refreshskin").stream()
                    .filter(option -> option.startsWith(args[0].toLowerCase()))
                    .toList();
        }

        if (args.length == 2 && ("points".equalsIgnoreCase(args[0]) || "refreshskin".equalsIgnoreCase(args[0]))) {
            List<String> names = new ArrayList<>();
            for (Player player : Bukkit.getOnlinePlayers()) {
                if (player.getName().toLowerCase().startsWith(args[1].toLowerCase())) {
                    names.add(player.getName());
                }
            }
            return names;
        }

        return List.of();
    }

    private void showPoints(CommandSender sender, String[] args) {
        if (args.length < 2) {
            sender.sendMessage("Usage: /leaderboardhavoc points <player>");
            return;
        }

        OfflinePlayer target = Bukkit.getOfflinePlayer(args[1]);
        if (target.getUniqueId() == null) {
            sender.sendMessage("Player not found.");
            return;
        }

        PlayerRecord record = plugin.dataStore().load(target.getUniqueId());
        if (record.username().isBlank()) {
            sender.sendMessage("No local leaderboard data found for " + args[1] + ".");
            return;
        }

        sender.sendMessage(record.username() + ": " + record.points() + " points, "
                + record.kills() + " kills, " + record.deaths() + " deaths.");
    }

    private void refreshSkin(CommandSender sender, String[] args) {
        if (args.length < 2) {
            sender.sendMessage("Usage: /leaderboardhavoc refreshskin <player>");
            return;
        }

        Player target = Bukkit.getPlayerExact(args[1]);
        if (target == null) {
            sender.sendMessage("Player must be online to refresh their current skin.");
            return;
        }

        SkinData skinData = SkinService.from(target, plugin.settings().elyByLookupEnabled());
        PlatformData platformData = PlatformService.from(target);
        plugin.dataStore().getOrCreate(target, skinData, platformData);
        boolean changed = plugin.dataStore().updateIdentity(target, skinData, platformData);
        PlayerRecord updated = plugin.dataStore().load(target.getUniqueId());
        plugin.apiClient().refreshSkin(updated, skinData);

        sender.sendMessage("Queued skin refresh for " + target.getName() + (changed ? "." : " (no local skin change detected)."));
    }
}
