![GBF Timers Logo](https://cdn.discordapp.com/attachments/1059460680920612924/1066506968430301234/Screenshot_2023-01-22_015445-removebg-preview.png)
# GBF Timers V2

### Warning 
V1 code is out-dated an no longer used, use only if you know what you're doing.

## Data Protection
### Due to this version being free for public use rather than closed access compared to V1, data protection is very important.

Your data will be closed and inaccessible by anyone, the data is updated using a computer and there is no manual work this means that no human will be in-between you and your data.
You can request data deletion and that process will also be automatically done using a computer to ensure no human can view your data.

Your data is encrpyted using AES256-CBC [256-bit Advanced Encryption Standard in Cipher Block Chaining mode], this protects your data by encrypting your data from the client to the secure database.

## How to access for free
[Click here](https://discord.com/api/oauth2/authorize?client_id=795361755223556116&permissions=1642787765494&scope=bot%20applications.commands) to invite GBF Timers to your server with the required permissions

## New Main Features

- Enhanced system performance and less loading times:
This was done by greatly improving the code and general connections to the server.

### New display features:
1. Semester naming to help identifiy which data is for which group
2. Just finished session difference from average session data

### Removed in-compatible features
1. System time welcome messages
2. System time footers

### Added Multi-User support
Now the system supports multiple users but users are limited to their own commands so no one can manipulate your data without access to your account.
This also means that now many users can use the timer and track their data for free.

### Level system

Since the system is now open to the public, we find that having a progression system helps keep people interested, we plan to improve this system in the future.
1. Sesaonal level
This is a temporary level that resets after each season/semester.
2. Account level
This is a permenant level.

### Major Updates
1. Daily login system 
1.1. You can now earn rewards by logging in daily and claiming your daily reward, starting a session is not required. Reward increases proportionally with the streak.
1.2. You can now earn XP and a new currency (dunkelCoins) through the daily login, making leveling up slightly easier
1.3. Daily login streaks

### Balance Updates
1. Improved XP gained from 10 XP per 5 minutes to 150 XP per 5 minutes.
This change was needed since the level grind became too "hardcore" where you needed 998 hours to reach level 100 from level 99

### Small Updates
1. Added session topic
2. Added change session topic
3. Changed level up emoji
4. Renamed season to semester
5. Made leveling up easier for semester level and account level, 300 and 500 less respectively 
6. Added average time between breaks
7. Added semester recap in the reset command
8. Added the help command in the registry command as a tutorial
9. Removed rounding and added thousandth seperator and break number in the un-pause logic
10. Changed weekly average time stat to use the newest week rather than all weeks combined
11. Increased the length of the progress bar
12. Changed progress bar to have more realistic updates
13. Moved repeated functions to a logic utils file to improve performance and help with code maintenance 

### Bug Fixes
1. Fixed an issue where the pause command would run but never update the data to the DB.
2. Fixed a bug where when multiple initiate messages would be present, the old ones would update.
3. Fixed a bug that would display negative stats.
4. Fixed a bug that would give undefined for the total time
5. Fixed a bug that would close the timer without showing the session stats.
6. Fixed a bug where the buttons would close without reason.
7. Fixed a bug where when the user's internet is slow, the buttons would trigger but nothing would happen, this would cause the buttons to update but not the data.
8. Fixed a security issue where other users could tamper with your session.
9. Fixed a bug where the session would never end.
10. Fixed a bug where the pause timer would not stop.
11. Fixed a bug when the user would force stop while the timer would pause, this would cause the data to not update.
12. Fixed a bug in the time calculations.
13. Fixed a bug where the real and total time would be 1 second apart.
14. Fixed a bug where the display command would not run when in-sufficient data was provided.
15. Fixed a level system bug where it would take triple the hours required to level up
16. Fixed a bug where some stats would not reset when the reset command was ran.
17. Fixed a bug where the timer would kill the system when attempting to pause.
18. Fixed a bug where system would mix the button users with the original command author.
19. Fixed a bug where the system would give the wrong IDs.
20. Fixed a bug that would stop the session info from running.
21. Fixed a bug where the time would be negative if the break time was larger than the session duration
22. Fixed no embed colour for the timer info command
23. Fixed a bug that showed the s in units when the data was only 1
24. Fixed a bug that didn't reset the session topic even after the session ended
25. Fixed a bug that didn't reset the session topic in the reset command
26. Fixed a display bug that showed "second" instead of "seconds" when the time would be more than 1
27. Fixed a bug that would level up the user in both account and season fields if only one of them triggered
28. Fixed a bug that wouldn't add the session time to the database
29. Fixed a bug that showed the weekly time stat with a large number of decimal points
30. Fixed a bug that would crash the system if the user's account level increased
31. Fixed a bug that would start a new timer even if one is already active
32. Fixed a bug that would give the wrong XP required for the user's account level
33. Fixed a bug that would give both coins and XP when claiming your daily reward
34. Fixed a bug that would give no progress bar if the user passed a certain percentage point
35. Fixed a bug that would look for an active session in the daily login command
36. Fixed a bug that would not check if the user has enough XP to level up
37. Fixed a bug that would level up both account and semester if one of them leveled up
38. Fixed a bug that would not save the new date when the user claimed the daily reward

GBF Timers is now available for public use and the source code is now open source.

### Future Plans

- Added a level leaderboard
- Cheater detection
- Custom embed colouring
- Semester score

## Under GBF
