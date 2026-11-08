# Warnings

![Warnings panel](img/avisos.png)

The **Warnings** button shows how many there are. Each says in words what is wrong and has **Go to the warning**. **Warnings never stop you from exporting.**

Three severities, each with its own shape as well as colour (circle, triangle, square): **error** (the document would be wrong: a row pointing at something that no longer exists, two instruments whose DMX ranges overlap, two universes with the same network number, two cables on the same input, two elements with the same IP, a dimmer or phase over its limit, a bar over its load), **warning** (probably wrong: channels with no name or mic, a stereo pair starting on an even channel, a wedge asked for but not drawn, an instrument missing data, an unmarked outlet, repeated units, a badly written time, a program that does not exist for the computer's system, the same patch on two channels, a typed patch that differs from the cables, more channels than lines on a cable, a DMX fixture running past 512, a free-form stage whose outline crosses itself, a cable the element cannot carry (a video cable on a drum kit), a cable longer than its connector usually allows, more than 32 fixtures on a DMX line without a splitter, a network cable that closes a loop, no contact or date) and **tip** (an improvement: gaps in numbering, unordered monitors, no “supplied by”, a channel or output whose element has no audio cable once you draw cables).

Warnings also show as a small mark on the table row and a badge on the plot element; filter them by severity in the panel.

**Mute** hides a warning you have decided to live with: it leaves the count, the marks and the list. **Show muted** brings them back (marked “Muted”) and **Unmute** restores one. Each is an undo step.
