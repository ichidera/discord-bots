Terms of Service

Last Updated: August 20, 2026

These Terms of Service ("Terms") govern your use of Katharsi ("the Bot"), a Discord administration bot designed to perform bulk channel management, backups, and restoration operations.

By inviting, configuring, or using the Bot, you agree to these Terms. If you do not agree with these Terms, do not use the Bot.

1. Description of the Bot

Katharsi is a Discord administration tool that allows authorized server administrators to perform operations including:

Deleting and recreating individual channels.
Deleting server channel and category structures in bulk.
Creating local backups of channel structure.
Restoring channel and category structure from a backup.
Managing channel permissions and related channel configuration through the Discord API.

The Bot operates through Discord's official API and is intended for use by server owners and administrators who understand the consequences of the actions they perform.

2. Eligibility and Authorization

You are responsible for ensuring that you have sufficient authority to use the Bot on any Discord server where it is installed.

You must not use the Bot to perform actions that you are not authorized to perform.

The Bot may require elevated Discord permissions, including permissions such as Administrator, Manage Channels, or Manage Roles, depending on its configuration.

Granting the Bot permissions is your responsibility. You should only grant permissions that you are comfortable allowing the Bot to use.

3. Destructive Operations

The Bot contains intentionally destructive functionality, including /nuke and /fullnuke.

These commands may permanently delete Discord channels and their contents.

Before using a destructive command, you are responsible for:

Confirming that you are operating on the intended server.
Confirming that you have authorization to perform the operation.
Creating a backup where appropriate.
Understanding what information will and will not be preserved.
Confirming the operation when prompted.

The Bot does not guarantee that destructive operations can be reversed.

4. Backups and Restoration

The Bot may create backups containing server channel and category structure and related configuration.

Backups are not guaranteed to contain:

Message contents.
Deleted message history.
Threads.
Pins.
Attachments.
Other information that is not exposed or recoverable through the Discord API.

Restoration attempts to recreate supported server structure using the information available in the backup.

A successful restoration is not guaranteed.

You are responsible for maintaining any additional backups or exports necessary to preserve information that is important to you.

5. Data and Storage

The Bot may store backup information locally in order to provide its backup and restoration functionality.

You are responsible for securing the machine, server, container, filesystem, or other environment where the Bot and its backup files are running or stored.

You should not store or expose Bot credentials, Discord tokens, or backup files publicly.

If you operate your own instance of the Bot, you are responsible for the security and handling of the data stored by that instance.

6. Discord

The Bot is designed to interact with Discord through Discord's API.

Your use of the Bot remains subject to Discord's applicable Terms of Service, policies, and developer requirements.

The Bot is not affiliated with, endorsed by, or sponsored by Discord unless explicitly stated otherwise.

Changes to Discord's API, permissions, rate limits, policies, or functionality may cause some or all Bot functionality to stop working.

7. Prohibited Use

You agree not to use the Bot to:

Perform unauthorized actions on a Discord server.
Destroy or modify servers without appropriate authorization.
Circumvent Discord's security, permission, or access controls.
Abuse Discord's API or intentionally bypass API restrictions.
Use the Bot for unlawful purposes.
Use the Bot to facilitate harassment, abuse, fraud, or other harmful activity.
Attempt to interfere with the Bot, its infrastructure, or another user's instance.
8. No Warranty

The Bot is provided "AS IS" and "AS AVAILABLE", without warranties of any kind, express or implied.

We do not guarantee that:

The Bot will always be available.
Commands will always execute successfully.
Backups will always be complete or usable.
Restorations will perfectly reproduce the previous server structure.
Discord will continue to support the APIs or functionality required by the Bot.
Data deleted through the Bot can be recovered.

You use the Bot at your own risk.

9. Limitation of Liability

To the maximum extent permitted by applicable law, the Bot's developer(s) and contributors shall not be liable for any direct, indirect, incidental, consequential, or other damages arising from or related to the use or inability to use the Bot.

This includes, without limitation:

Loss of messages or other Discord content.
Loss of channels, categories, permissions, or server configuration.
Failed or incomplete restorations.
Loss or corruption of backup files.
Discord account or server consequences.
Service interruptions.
Misuse or unauthorized use of the Bot by another person.

You are responsible for verifying commands and maintaining independent backups of anything you consider important.

10. Third-Party Services

The Bot depends on third-party services, including Discord.

We are not responsible for outages, API changes, rate limits, policy changes, or other failures caused by third-party services.

11. Termination

Access to the Bot may be suspended or terminated at any time if the Bot is being used in violation of these Terms or in a manner that may harm the Bot, its infrastructure, other users, or third parties.

You may stop using the Bot at any time by removing it from your Discord server and deleting your local installation and associated files, where applicable.

12. Changes to These Terms

These Terms may be updated from time to time.

If material changes are made, the "Last Updated" date will be changed accordingly.

Continued use of the Bot after changes are published constitutes acceptance of the updated Terms, to the extent permitted by applicable law.

13. Contact

For questions, bug reports, or concerns regarding these Terms, contact the Bot's developer through the project's official support or repository channels.

14. Acceptance

By installing, inviting, configuring, or using Katharsi, you acknowledge that you have read, understood, and agreed to these Terms of Service.

Use destructive commands carefully. If you delete something, you are responsible for making sure you meant to delete it.