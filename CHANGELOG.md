# Changelog

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
