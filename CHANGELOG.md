# Changelog

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
