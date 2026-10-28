# Changelog

## 1.4.13 (28 October 2026)

- **Weapons, starting wargear and options re-read from Wahapedia for every army.** Range, attacks, skill, strength, AP, damage and keywords of every weapon now match the Wahapedia datasheet (about 1,700 fields corrected); weapons that were renamed, filed as melee instead of ranged (or the reverse) or missing were fixed or added; the starting wargear of about 500 model rows follows the datasheet's loadout text; and well over 100 units had their upgrade options rebuilt from the datasheet's option sentences, with the options Wahapedia no longer offers removed. A change is applied only when the converter can prove it, so a unit it cannot read is left exactly as it was.
- The T'au drone options (Strike Team, Breacher Team, Ethereal, Cadre Fireblade, Crisis, Broadside, Riptide, Stealth, Pathfinder, Vespid) are kept as plain wargear.
- **Points that did not match New Recruit:** a list with Death Company Marines with Jump Packs came to 1,740 instead of 2,000 because "10x Death Company Marine" was not matched to the row "Death Company Marines with Jump Packs" and the unit was counted as 5 models. Models whose name is the start of a single row are now matched (a weapon with such a name, like a Burna, is not a model). Also, items a model starts with (the missile pod of a Crisis Fireknife, a Ravager's dark lance, the Leman Russ lascannon, the Repulsor Executioner's heavy laser destroyer) were charged as extras on top of the unit price; they are now free, and 3,868 unit sizes of all armies give the same points after export and import.
- **Phone home screen:** the list of rosters no longer runs off the right edge (long list names pushed the points and the menu out of view). On phones the big "Build a new list" block is replaced by a round + button in the corner; Import list stays below the rosters.
- What is still unread is listed in the converter repository (`wargear-options-unread.md`, 143 unit rows).

## 1.4.12 (30 October 2026)

- **Devoted of Ynnead (Aeldari):** the 11 Ynnari datasheets (Yvraine, The Yncarne, The Visarch and the Ynnari units) are only offered, and only accepted in a list, when that detachment is chosen. The detachment also asks for Yvraine and/or The Yncarne and for one of them to be your Warlord: the list shows an error if neither is included or if the Warlord is someone else, and an imported list marks the one it finds. The keyword the detachment gives to Asuryani units is not modelled; no enhancement or rule of the app depends on it.

## 1.4.11 (30 October 2026)

- **Wolf Guard Headtakers priced right:** the Munitorum Field Manual, Wahapedia and New Recruit all give four prices: 3 Headtakers 85, 3 Headtakers + 3 Hunting Wolves 115, 6 Headtakers 170, 6 + 6 Wolves 230 (95, 125, 180 and 240 from the third unit). The price follows the number of Headtakers and every Hunting Wolf adds 10, which fits all eight prices. Before, three Headtakers with three Wolves cost 170. Units can now say which model type sets the price (`PointsModel`) and which models add a fixed cost (`ModelCosts`).
- **Models written in an imported text keep their counts** when the datasheet allows them ("6x Wolf Guard Headtakers" stays six Headtakers instead of three plus three Wolves).
- **Allied units for more detachments:** besides Deathwatch Support, these now bring their allies into the unit picker and into imported lists, within the points cap of the battle size (500 / 1,000 / 1,500 for Incursion / Strike Force / Onslaught, or 500 flat), and none of them can be your Warlord where the rule says so: Brood Brothers Auxilia (Genestealer Cults with Astra Militarum, except Aircraft, Commissars, Epic Heroes, Militarum Tempestus, Ogryns, Ratlings, Enginseers and Ministorum Priests), Tallyband Summoners (Death Guard with Nurgle Daemons), Carnival of Excess (Emperor's Children with Slaanesh Daemons), Changehost of Deceit (Thousand Sons with Tzeentch Daemons), Khorne Daemonkin (World Eaters with Khorne Daemons), Reaper's Wager (Drukhari Harlequins), Iconoclast Fiefdom (Chaos Knights with the Damned of the Chaos Space Marines) and Questor Forgepact (Imperial Knights with a Tech-Priest Dominus or Manipulus and Skitarii Marshal, Rangers and Vanguard).
- Devoted of Ynnead followed in 1.4.12.

## 1.4.10 (30 October 2026)

Checked against New Recruit itself (its Text Import, with the Orks list that gave errors there).

- **Text import dialog:** Import list → Text import now opens a dialog like New Recruit's: choose the army or let it be detected, give the list a name and a points limit if you want, paste the text, and the line under the box says what was understood while you paste ("No import issues · Ultramarines · 14 units · 2000 pts", or the things to check). Import now creates the list.
- **Boyz and Beast Snagga Boyz:** the datasheet allows 1-2 Nob and 9-18 Boy models (10 to 20 in all). The data had a single Nob and up to 19 Boyz, so a unit could be 1 Nob + 19 Boyz = 20, one more than the datasheet allows. With 20 models you now get 2 Nobs + 18 Boyz, and with 19 models 1 Nob + 18 Boyz, as New Recruit shows. All other units were compared row by row against Wahapedia (1,054 datasheets) and have the right limits.
- **Support characters must be attached:** "Each support unit in your roster must be attached to a bodyguard unit" (core rules). The Painboy, Runtherd and other Support characters now show "must be attached to a bodyguard unit", which is the one error New Recruit gave for the Orks list.
- **Limits of a model type:** a list with more or fewer models of a type than the datasheet allows (for example 19 Boyz) shows an error.
- **Sizes are not restricted to 10 or 20:** version 1.4.9 treated the points table (Boyz 10 or 20 models) as the only allowed sizes. New Recruit accepts any size the datasheet allows, priced by the tier that covers it, and so does projectWar again.
- **GW text export:** attached units are written as "Attached unit N" with "Attached as: Leader / Support / Bodyguard", and every weapon with its count ("7x Boltgun"), the way New Recruit writes them. Importing that text gives back the same list, with the same points.

## 1.4.9 (29 October 2026)

Found with two lists that New Recruit rejected and projectWar did not, and a Deathwatch Support list that did not import.

- **Deathwatch Support works:** the detachment lets Deathwatch units into a Space Marines army (and any Chapter): they appear in the unit picker and in imported lists, their combined cost may not exceed 500 points, and none of them can be your Warlord. The rule is described in the data (`Allies` on the detachment), so other detachments with allies (Ynnari, Brood Brothers, Legions of Excess...) can use it; they are still to be described one by one.
- **Unit sizes (corrected in 1.4.10):** the first reading of the Munitorum Field Manual as "only 10 or 20 models" was wrong and was withdrawn in the next version.
- **List title:** a list named like a unit ("Boys") no longer adds that unit; the first line of an exported list is its title.
- **Points updated to the Munitorum Field Manual 1.6:** 21 units still had earlier points: Deathwatch Terminator Squad (190 for the first two, 230 for the third), Fortis, Indomitor and Spectrus Kill Teams, Kastelan Robots, Plagueburst Crawler, Space Wolves Venerable Dreadnought and 12 Imperial Agents datasheets (Inquisitor, Coteaz, Draxus, Vindicare and Eversor Assassins, Navigator, Voidsmen-at-Arms, Subductor Squad, Sisters of Battle Squad, Grey Knights Terminator Squad and others). Wolf Guard Headtakers, where the Manual gives two prices for six models, was left for a manual look.

## 1.4.8 (29 October 2026)

Checked with three recent undefeated Ork lists from Listhammer (War Horde, Kult of Speed + Flyboyz + Dread Mob, and Green Tide + Runt Swarm + Taktikal Brigade). They now import to the exact points (2,000, 2,000 and 1,995) with no errors.

- **Force disposition from the text:** the importer ignored the force disposition written in the list (it always chose the first one allowed), so a Reconnaissance list came in as Purge the Foe. It is read now, for every list.
- **Orkish plurals:** "Boyz", "Meganobz", "Nobz" and "Beast Snagga Boyz" are the same models as "Boy", "Meganob", "Nob" and "Beast Snagga Boy". Before, "18x Beast Snagga Boy" counted as zero models and the unit came in at half its size.
- **Options named in the plural:** "3x Twin Killsaws" now picks the option "twin killsaw" (and its 5 points each).
- **Enhancement with a note:** "Minefield Detail (Upgrade) - 6" scout" is read as Minefield Detail.
- **Runt Swarm:** "Friendly Gretchin units have Battleline", so Gretchin follow the Battleline limit (6, not 3) when that detachment is in the army. Detachment texts of that shape work for any army.
- **Lists in the form "Warboss 100 points"** (no brackets), as Listhammer prints them, are read too.

## 1.4.7 (28 October 2026)

- **Wargear options, second pass:** the converter now reads more of the printed option sentences ("can replace their X with", "Navis Sergeant-at-Arms' shotgun can be replaced with", "For every 5 models in this unit: ...", "&" written as "and", "1 additional storm bolter", plurals such as Legionaries/Legionary, a typo in the printed text) and ignores designer's notes. 20 more units were rebuilt (among them Noise Marines, Winged Hive Tyrant, Acolyte Hybrids, Cthonian Beserks, Hekaton Land Fortress, Vindicator, whose duplicated option is gone, and Onager Dunecrawler).
- **A rebuild can no longer make a unit worse:** the converter refuses to rebuild a unit if any model type would lose an option, or if a limit ("up to 2", "for every 10 models") would be lost or loosened. Four units that would have regressed this way (Chaos Terminator Squad, Blightlord Terminators, Nemesis Claw, Atalan Jackals) were caught and kept as they were.
- **What is still not read:** 121 units still keep their previous options because the datasheet text cannot be turned into options safely (missing starting wargear, weapons without a profile such as drones, a sentence that names several model types). The list, with the reason for each, is published in the converter repository (`wargear-options-unread.md`) so they can be checked one by one.

## 1.4.6 (28 October 2026)

- **Upgrades (Ironstorm Spearhead, Chorus of Condemnation, Talons of the Norn Queen...):** the enhancements marked Upgrade can be used up to three times in the army, and the copies after the first do not count towards the enhancement limit (they still cost their points). Before, the app said "used more than once" and "too many enhancements (5/4)". An ordinary enhancement is still limited to one.
- **Dedicated Transports** (Sagitaur and the rest) follow the Battleline limit: 6 in a Strike Force instead of 3.
- **Space Marines army rules:** the 10th edition rule "Oath of Moment" is gone from Space Marines and every Chapter. They now show Combat Doctrines, Transhuman Strategist and Librarius from the 11th edition datasheets, followed by Space Marine Chapters.
- **Wargear options for the leader of a squad:** when the datasheet says "any number of models can each replace...", the Sergeant, Superior, Pack Leader or Prime now gets the same options as the rest (before, only the largest group did). This was why a Paragon Warsuits list cost 10 points less than in New Recruit. 66 units in 23 files were rebuilt this way (Aggressors, Centurions, Inceptors, Bullgryns, Tzaangors, Wolf Guard Terminators and more). The converter now refuses to rebuild a unit when that would remove an option that exists today; those cases stay as they were.
- **Import:** the "Attached unit" groups of New Recruit ("Attached as: Leader / Support / Bodyguard") now join each leader and support to its bodyguard unit, a datasheet that must be the Warlord (Morvenn Vahl) is marked when the export does not, and the notes list the units whose points differ from the text. Checked with real lists of Adepta Sororitas (1,985), Space Marines (1,990) and Tyranids (2,000): all match New Recruit to the point.

## 1.4.5 (28 October 2026)

- **Wargear options that replace:** the Kasrkin Sergeant, the Tempestor of the Tempestus Scions and the Brotherhood Terminator Squad now replace the weapon the datasheet says (before, the chosen weapon was added to the printed one, so a Sergeant carried a hot-shot laspistol, a chainsword, a power weapon and a plasma pistol at once). The cause was a footnote under the option list ("You cannot select the same weapon more than twice") that stopped the conversion of the whole unit; the converter now ignores such footnotes.
- **Rules text among the weapons:** nine units (Death Korps Watchmasters, Jungle Fighter Sergeants, the Tempestor, Atalan Jackals, Inquisitorial Agents, Brôkhyr Iron-Master, Grimnyr, Firesight Marksman and Neurogaunt Nodebeasts) listed a sentence of the datasheet as if it were a weapon. Removed, and a data test now fails if any starting wargear looks like a sentence.
- About 260 other units still have wargear options the converter cannot read safely (the reasons are listed in the converter report); they keep their previous options and are reviewed one by one.

## 1.4.4 (28 October 2026)

- **YellowScribe weapons:** the weapons written for each model are now matched by exact name (a profile such as "Plasma gun – supercharge" counts as the plasma gun), so a model no longer receives weapons that only share part of a name. Tried against the live service: it accepted an 18-unit Astra Militarum list and returned a code.

## 1.4.3 (28 October 2026)

- **YellowScribe code, like the original app:** Export → Yellow Scribe now has a **Get YellowScribe code** button. projectWar hands your list to YellowScribe and shows the code to paste into the Tabletop Simulator mod (it works for about 10 minutes). Because YellowScribe does not accept calls straight from a web page, the list goes through a small relay of this site that keeps and logs nothing; this is the only server-side code of projectWar. The file download stays as an alternative. The privacy and cookie notices (English and Spanish) now say that this one button sends the list to yellowscribe.link, and nothing is sent unless you press it.

## 1.4.2 (27 October 2026)

- **YellowScribe export:** Export → Yellow Scribe downloads your list as a `.rosz` roster file built in your browser: the statlines, the weapons of each model, the abilities (with the enhancement and the Warlord mark) and the keywords of every unit. Upload it at yellowscribe.link and paste the code into the Yellowscribe mod in Tabletop Simulator. The structure follows what the open-source YellowScribe parser reads for 11th edition rosters; it has not yet been tried on the live service.

## 1.4.1 (27 October 2026)

- **Backup reminder:** your lists are stored only in this browser, so the home screen now offers a backup when you have not made one for 3 days after your first list, or for 14 days after the last one. "Back up now" downloads a dated file (`projectwar-lists-YYYY-MM-DD.json`); "Later" hides the reminder for a week. Settings shows the date of the last backup.
- The app also asks the browser to keep its storage (so it is not cleared when the device runs low on space). Browsers decide this on their own and may ask you.

## 1.3.5 (27 October 2026)

- **Better PDF:** Export → Pdf now prints an A4 sheet with a header (army, detachment, disposition, points), the datasheets in two columns without cutting a unit across pages, the enhancement with its cost (and its text when Descriptions is on), the Warlord mark, the core abilities, and a footer with the app and data version. Choose "Save as PDF" in the print window.
- YellowScribe export checked and closed: it only reads New Recruit or BattleScribe rosters, so the route is New Recruit.

## 1.3.4 (27 October 2026)

- **Share link and QR code:** Export → Share link builds a link that holds the whole list (packed into the address, nothing is stored on a server) and a QR code for it. Opening the link shows the list and offers to save a copy; it never touches your other lists. Links from other people are checked like any imported file. A 2,000-point list makes a link of about 1,700 characters.
- **Importing text lists:** an enhancement written as an ordinary bullet (without the "Enhancements:" prefix) is now recognised, and so is the Warlord marker named after the army (for example "Militarum Tempestus Warlord"). A real 2,000-point Astra Militarum list now imports to exactly 2,000 points, with its three Command Squad enhancements and its Warlord. Leaders still stay unattached when the text does not say which unit they lead.
- Tabletop Simulator export is no longer part of the web scope (a web page cannot write to the game folder); it moves to the app scope in the roadmap.

## 1.3.3 (27 October 2026)

- **Text export:** choosing Text on the Export page now shows its options and a live preview on the same page. Four formats: GW (the official-app layout, which imports back into projectWar and New Recruit), Tournament (header block with Warlord, enhancements and numbered units), Short and Simple. You can leave out the wargear or the header, add a player and a team name, then download a .txt or copy the text.

## 1.3.2 (27 October 2026)

- **Detachment rules reached units they do not apply to:** an effect that lists several keywords (for example Designation Force: Astra Militarum Infantry Smoke) was applied to every unit that had any one of them, so a Leman Russ Battle Tank received the Signal Flares ability. A unit must now have all the keywords. 34 detachment effects in 17 armies were affected (among them Champions of Fenris, Steel Hammer, Chorus of Condemnation, Armoured Warhost, Starshatter Arsenal and Cult of the Arkifane). The Null Maiden Vigil effect on Prosecutors also pointed to a name that no longer exists and now reaches them.
- **New Recruit files:** checked with real exports (.json, .ros and .rosz of the same list). All three import to the same list: army, detachment, force disposition, battle size, Warlord, enhancements and models, and the total matches New Recruit to the point (1995). Import list → Import list file now accepts .ros and .rosz.

## 1.3.1 (27 October 2026)

First package of the 1.3 line (sharing and export).

- **Import lists from New Recruit and the official app:** Import list → "Paste a list" accepts the text you copy from New Recruit (share / export as text), from the official Warhammer 40,000 app, and BattleScribe-style text or roster JSON. It finds the army, the detachments, the battle size, the units with their number of models, the Warlord, enhancements, wargear options named in the list and leaders attached with an explicit line. It uses the points of the current Munitorum Field Manual instead of the points written in the list, and shows a report of anything it could not match (units are never guessed) and what to check. Reading a file with the same formats works too, and our own backup files import as before.

## 1.3 (in development)

Sharing and export (phase 2 of the roadmap): import from other builders (done), share links and QR codes, more text formats, PDF, and the YellowScribe and Tabletop Simulator exports. See [ROADMAP.md](ROADMAP.md).

## 1.2.8 (27 October 2026)

- **Nork Deddog:** he has the same Loyal Protector ability as the Ogryn Bodyguard, so like the Ogryn he must be joined to a Command Squad, and now he can be (before, no Command Squad accepted him). A Command Squad takes only one Loyal Protector (Ogryn or Nork, not both). The same rule now covers every unit that joins another unit (Support Weapon platforms, Servitors, Cryptothralls...): one of each kind per unit.
- **Warlord ban restored:** Nork Deddog, the Ogryn Bodyguard and Sly Marbo cannot be your Warlord. A 1.1.1 data fix had cleared this by mistake, because their datasheets say "cannot be selected as your Warlord" and the check only knew the wording "cannot be your Warlord". A test now covers both wordings.
- **Lieutenant with Combi-weapon:** removed the 10th-edition ability "Last Survivor", which the 11th edition datasheet no longer has.

## 1.2.7 (27 October 2026)

- **Donate button:** Settings (Support) and the home panel now have a link to donate through PayPal. It is a plain link that opens PayPal in a new tab: the app sends nothing to PayPal, and the security policy of the site is unchanged. The privacy policy and the terms (English and Spanish) now say that donations are voluntary, are made on PayPal's site, are not refundable by the project and unlock nothing.

## 1.2.6 (27 October 2026)

- **Detachment rules that grant an ability:** Recon Element (Stealth to Astra Militarum units except Titanic), Shadowmark Talon (Stealth to Adeptus Astartes units) and Emissaries Imperatus (Fights First to Adeptus Custodes units) now show the ability on the datasheets of the units they affect. The other detachment rules are conditional (re-rolls, triggers, "while", battle rounds), so they stay as text.

## 1.2.5 (27 October 2026)

- **Soul Grinder is back:** the Chaos Daemons Soul Grinder had been lost in the conversion and could not be added to a list. It is restored with its 11th-edition statline and abilities, its price by copy (180 / 195) and the choice of Mark (Khorne, Tzeentch, Nurgle, Slaanesh) that adds its extra weapon.
- **Checked against the Munitorum Field Manual:** of the 958 units that are not Legends, 957 were already in the data; the Soul Grinder was the only one missing. The Furies, Giant Chaos Spawn, Spined Chaos Beast, Regimental Attachés and Kill Team Cassius are Legends, so they stay out.

## 1.2.4 (27 October 2026)

- **Attached units stay in one group:** a Command Squad leading a Krieg squad, with an Ogryn Bodyguard joined to the Command Squad and a Psyker beside it, is one unit and now shows as one group (with all its points added), instead of two overlapping groups. Three such units show as three groups, not six.

## 1.2.3 (27 October 2026)

- **Marks and detachment options are back:** the conversion had dropped options that the original data offered, so Daemon Princes of the Heretic Astartes could not choose their Mark, Pactbound Zealots units could not choose theirs, and vehicles in detachments such as Steel Hammer or Houndpack Lance could not become Characters. 117 options were restored (58 tied to a detachment, 59 plain ones such as vox-casters, banners and Marks).
- **Enhancements follow the chosen options:** a unit that picks a Mark (Khorne, Tzeentch...) or "Steel Hammer Character" now counts that keyword when the list checks which enhancements it may take, and a unit made a Character that way can be your Warlord. Before, only the keywords printed on the datasheet were considered.

## 1.2.2 (27 October 2026)

- **Enhancements that change the datasheet:** 121 more enhancements now apply their effect to the unit (they only had text before): extra weapon abilities such as [PRECISION] or [ANTI-INFANTRY 5+], +1 Attacks to Pistols, +1 OC, +1 Toughness, +2" Move, Feel No Pain, Scouts, Infiltrators, Stealth, Deep Strike and Fights First granted to the bearer or its unit. Conditional effects (re-rolls, auras, "once per battle") stay as text, because they do not change the printed statline.
- **Weapon effects fixed:** an effect with no stated weapon type is now melee only, as in the data (before, effects such as Mark of Devotion also changed ranged weapons); effects limited to named weapons (Stone of Eldritch Fury, Psychic Destroyer, Bilemaw Blight) now touch only those weapons; and the Plasma Accelerator Rifle now adds a separate stronger weapon instead of changing the plasma rifle.

## 1.2.1 (27 October 2026)

First package of the 1.2 line. Bug fix.

- **Browser Back and Forward:** the browser's Back and Forward buttons now move between the app's screens instead of leaving the app. Opening a list, a rules page or a unit adds a history entry; Back returns to the previous screen with the same open list and the same scroll position, and Forward returns to the screen you came from. Back from the first screen still leaves the app, as usual. The on-screen Back button follows the same history.

## 1.2 (27 October 2026)

Closes what 1.1 left open in the data: enhancements and detachment rules that change the datasheet, the options and Marks the conversion had dropped, the Soul Grinder, the checks against the Munitorum Field Manual, and a round of bug fixes found by players (Back and Forward of the browser, attached units, leaders and Support, Guard battleline, per-model weapon limits). Fixes made along the way are listed above, under 1.2.1 to 1.2.6.

Still waiting for the maintainer: the two repository secrets that let GitHub deploy the site by itself, and the check of the points against the official Munitorum Field Manual PDF. Sharing and export (phase 2) are version 1.3. See [ROADMAP.md](ROADMAP.md).

## 1.1.6 (27 October 2026)

Closes the data-review part of phase 1.

- **Wargear options from the datasheets:** the options of 609 units were rebuilt from the printed datasheets (what each model can swap, how many per 5 or 10 models, which weapons are offered). Examples fixed: Intercessor Squad grenade launcher, Scout Squad sniper rifle and shotguns, Sword Brethren, Crusader Squad, Tiger Shark missiles. 273 units with unusual wording were left as they were and are listed for hand review.
- **Accent colour:** Settings now has an accent colour (orange, blue, green, purple, red, teal).
- **New automated check:** every wargear option must have a weapon profile or a priced definition behind it.

## 1.1.5 (27 October 2026)

Bug-fix release.

- **Two Leaders on Guard battleline:** Cadian Shock Troops, Death Korps of Krieg, Catachan Jungle Fighters and Tempestus Scions can have two Leader units attached again (at most one of them a Command Squad), as their datasheets say. Kroot Carnivores can too once they have 20 models, without repeating a Leader. This was caused by the one-Leader limit added in 1.1.3, which now reads the exception from the datasheet.
- **Army-specific leader rules:** Death Guard Leaders can be attached even when another Leader is already attached; units that join another unit (Servitors, Cryptothralls, Tomb Crawlers, Aeldari support platforms, Loyal Protector) no longer count as a Leader; units that accept the same Leaders as another unit (Sanctifiers, Hastarii, Death Company Marines, Breaka Boyz, Nemesis Claw...) now accept them; Harlequin Death Jester, Shadowseer and Troupe Master are limited to one per army.
- **Wargear options:** Sword Brethren Squad and Death Company Marines with Jump Packs now follow their datasheets (weapon limits per 4 or per 5 models, the missing Twin lightning claws, Hand flamer and Inferno pistol).
- **Special weapons per model count:** limits written as "per 10 models" now count the whole unit, so a 20-model Cadian Shock Troops squad can take 4 special weapons instead of being stopped at 2.
- **Ogryn Bodyguard:** checked together with the Command Squad it joins, including a Command Squad that leads a Shock Troops squad, with no false errors.

## 1.1.4 (27 October 2026)

Bug-fix release.

- **Scroll position:** every screen now remembers where you were. Adding a unit, opening a block, changing an option or any other change no longer throws you back to the top, and going Back returns you to where you were on the previous screen. Opening a screen anew still starts at the top.

## 1.1.3 (27 October 2026)

Bug-fix release.

- **Enhancements for plain units:** 105 enhancements that Wahapedia marks as upgrades (for example Furious Assault, Gunnery Honours, Auric Eagle, Sharp Eyes) could not be selected on ordinary units, only read. They can now.
- **Leaders and Support:** following the core rule (a bodyguard unit takes one Leader unit and one Support unit, unless its datasheet says otherwise), the list now reports an error when a unit has more than that attached. Attaching stays optional, as the rule says "can".

## 1.1.2 (27 October 2026)

Bug-fix release.

- **Disposition list:** on the detachment rules screen the disposition menu offered every disposition of the faction. It now offers only the ones your chosen detachments allow, and keeps your choice while it stays valid.
- **Enhancements:** Daemonic Incursion was missing two enhancements (Geller Breach and Spite Made Manifest). Added.

## 1.1.1 (27 October 2026)

Bug-fix release. Versions are numbered major.minor.fix: the last number is only for bug fixes.

- **Warlord:** Epic Heroes that were missing the Character keyword (Saint Celestine, Fabius Bile, Gaunt's Ghosts, Company Heroes) can be your Warlord again. Ten units that were wrongly locked (for example Nork Deddog, Sly Marbo, Skarbrand, Bloodthirster, Great Unclean One) are unlocked, and Solitaire and Deathleaper are now locked as their datasheets say. C'tan Shards still cannot be Warlord and Orikan can.
- **Leaders:** a leader no longer needs a bodyguard unit to be valid. Only datasheets that say they must join another unit (Ogryn Bodyguard, Nork Deddog) are checked.
- **Points:** when a third (or later) copy of a unit costs more, only that copy gets the higher price; the earlier copies keep theirs. For example three Ironstrider Ballistarii now cost 80, 80 and 95.
- **Squad sizes:** Eradicator Squads, Outrider Squads, Rubric Marines, Plague Marines, Khorne Berzerkers, Noise Marines, Corsair Voidreavers, Skyreavers and Voidscarred, Pink and Blue Horrors, Warbuggies, Troupes and Starfangs could not be built at the sizes they are priced for (wrong model counts or limits). They can now.
- **Army rules:** they were not visible. They now appear (collapsible) in step 1 of a new list and in the list viewer.
- **Edition data:** abilities and stat lines left over from the 10th edition were replaced with the 11th-edition values (Space Wolves and the shared Space Marine roster first, then every faction: about 800 corrections).
- **Behind the scenes:** new automated checks for 10th-edition leftovers, Warlord eligibility, tiered prices and the sizes of every unit in every faction.

## 1.1 (27 October 2026)

Goal: **trust**. Data review, automated tests, a working theme setting, compact-layout parity and clear changelog access. See [ROADMAP.md](ROADMAP.md), phase 1.

Carried over to 1.2: structured effects for new enhancements and detachments, the donate button, the points check against the official Munitorum Field Manual, chapter exclusions, the god choice for Daemon Princes, missing datasheets, and the automatic deployment secrets.

What 1.1 delivers (fixes made after release are listed above, under 1.1.1 to 1.1.6):


- **New list:** expand any detachment to read its rule, restrictions, enhancements and every stratagem (when, target, effect, restrictions, CP cost) before adding it with the + button.
- **Themes:** light, dark and system (Settings → Application theme). The legal pages follow your choice.
- **Phones:** the editor, unit page and viewer now share the desktop design, and creating a list scrolls as one page with the Create button always in reach.
- **Force disposition:** when your detachments allow more than one (a detachment with two, or two detachments), step 1 of a new list now lets you pick the one you will play. It shows in the summary, the viewer and the text export.
- **What's new:** this page is now available from the home screen.
- **Data fixes:** two stratagems that had no text were repaired, list items keep their spacing, and leaders no longer point to units that do not exist (870 dead references removed, renamed units followed).
- **Behind the scenes:** automated tests for the app logic and the data, and automatic publishing of new data.

## 1.0 (27 October 2026)

First public version.

- Army list builder for Warhammer 40,000 11th edition (data version 11.3): factions and Space Marine chapters, detachments with detachment points, units with wargear options, enhancements, Warlord and attached leaders.
- Editor and viewer, datasheets, rules and stratagems, data search and history.
- Text and print export; backup and restore of lists as a file; lists stored in the browser.
- New visual identity: orange brand colour with a thin line in each faction's colour.
- Strict security: no cookies, no third-party requests, sanitised list imports.
- Privacy policy, terms of use and cookie notice (English and Spanish).
