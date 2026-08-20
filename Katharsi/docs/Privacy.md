Privacy Policy

Last Updated: August 20, 2026

This Privacy Policy explains how Katharsi ("the Bot") handles information when you install, operate, or interact with the Bot.

By using the Bot, you acknowledge the practices described in this Privacy Policy.

1. Overview

Katharsi is a Discord administration bot designed to perform bulk server management operations, including channel deletion, backups, and restoration.

The Bot is designed to collect and process only the information necessary to provide these features.

2. Information the Bot May Process

Depending on which commands are used, the Bot may process information available through Discord's API, including:

Discord server (guild) IDs.
Discord channel IDs.
Discord category IDs.
Channel names.
Channel types.
Channel positions.
Channel topics.
NSFW settings.
Voice channel configuration.
Permission overwrites.
Discord role IDs.
Discord user/member IDs where required to represent permission overwrites.
Backup information necessary to restore supported server structure.

The Bot does not intentionally collect or store the contents of messages.

3. Message Content

The Bot does not provide message-history backups.

When a channel is nuked or deleted, message contents that Discord no longer makes available through the API cannot be recovered by the Bot.

If preserving message history is important to you, you should use an appropriate Discord-approved logging or archival solution before performing destructive operations.

4. Backup Data

When you use /backup or /fullnuke, the Bot may create a backup file containing information about the server's channel and category structure.

Depending on the configuration, this may include:

Channel and category names.
Channel IDs.
Channel settings.
Channel positions.
Permission overwrites.
Role IDs.
Member/user IDs associated with permission overwrites.
Other configuration required for restoration.

Backup files are stored in the environment where the Bot is running.

For self-hosted installations, this generally means the computer, server, container, or filesystem controlled by the person operating the Bot.

5. Data Storage

Katharsi is intended to be self-hosted.

If you operate your own instance, backup data is stored on infrastructure under your control rather than being uploaded to a central database operated by the Bot's developer, unless your particular deployment has been configured to do otherwise.

You are responsible for protecting your own:

Backup files.
Server filesystem.
Hosting environment.
Environment variables.
Discord Bot token.
Other credentials used by your installation.

Do not publish backup files or Bot credentials in public repositories, websites, logs, or other publicly accessible locations.

6. Data Retention and Deletion

The Bot does not require permanent retention of backup files.

Backup files may remain on the host system until the operator deletes them or the hosting environment removes them.

If you operate an instance of the Bot, you can generally delete stored backup files directly from the environment where the Bot is running.

The Bot's developer cannot guarantee deletion of data stored by independently operated or modified instances.

7. Discord Data

The Bot receives information from Discord through Discord's API.

Discord may independently collect, process, and retain information according to its own policies.

The Bot does not control Discord's data practices.

For information about how Discord handles your information, refer to {"fallbackMarkdown":"Discord's Privacy Policy
","reference":{"matched_text":"","prefix":null,"start_idx":3912,"end_idx":3970,"safe_urls":[],"refs":[],"alt":"Discord's Privacy Policy
","prompt_text":"Discord's Privacy Policy
","type":"url","title":"Discord's Privacy Policy","item":{"title":"Discord's Privacy Policy","url":"https://discord.com/privacy?utm_source=chatgpt.com","attribution":"discord.com","pub_date":null,"snippet":null,"attribution_segments":null,"supporting_websites":null,"refs":[],"hue":null,"attributions":null},"layout":null,"logo":null},"showLoginRequiredCard":false}.

8. Information We Do Not Intentionally Collect

Katharsi does not intentionally collect or maintain:

Message histories.
Message contents for backup purposes.
Private messages.
Passwords.
Payment information.
Email addresses unless voluntarily provided through a support interaction.
Discord account credentials.

The Bot requires a Discord Bot token to operate, but this credential should remain private and is not intended to be shared with the Bot's developer.

9. Third-Party Services

The Bot relies on Discord and its API to function.

Third-party services may have their own privacy policies and data-processing practices.

We are not responsible for the privacy practices of third-party services that are outside our control.

10. Security

Reasonable precautions should be taken to protect information processed by the Bot.

However, no computer system, network connection, or storage system can be guaranteed to be completely secure.

If you self-host the Bot, you are responsible for securing the environment in which it operates.

In particular, you should protect your Discord Bot token and backup files from unauthorized access.

11. Children's Privacy

The Bot is not specifically designed to collect information from children.

The Bot should only be used in accordance with Discord's applicable age requirements and policies.

12. Changes to This Privacy Policy

This Privacy Policy may be updated from time to time.

When changes are made, the Last Updated date at the top of this document will be updated.

Your continued use of the Bot after changes are published constitutes acceptance of the updated Privacy Policy, to the extent permitted by applicable law.

13. Contact

If you have questions, concerns, or requests regarding this Privacy Policy, contact the Bot's developer through the project's official support or repository channels.

14. Your Responsibility

If you operate your own instance of Katharsi, you are responsible for ensuring that your deployment complies with any privacy, data-protection, contractual, or other legal obligations that apply to you.

This is particularly important if your server or organization is subject to specific privacy or data-protection requirements.

15. Acceptance

By installing, inviting, configuring, or using Katharsi, you acknowledge that you have read and understood this Privacy Policy.