// --- GLOBAL VARIABLES (Startup + Chapter 1) ---

// Player Profile & Identity
VAR player_name = "Unknown"
VAR surname = "Unknown"
VAR gender = "Unknown"
VAR player_he = "they"
VAR player_him = "them"
VAR player_his = "their"
VAR player_boy = "person"
VAR player_man = "person"
VAR player_sibling = "sibling"
VAR player_child = "child"
VAR player_mr = "Mx"
VAR hair = "Unknown"
VAR eyecolor = "Unknown"

// Morgan's Identity
VAR morgan_name = "Morgan"
VAR morgan_he = "they"
VAR morgan_him = "them"
VAR morgan_his = "their"
VAR morgan_hers = "They"
VAR morgan_title = "Mx."
VAR morgan_child = "child"
VAR morgan_male = "person"
VAR morgan_man = "person"
VAR morgan_fine = "fine"
VAR morgan_boy = "Mx"
VAR curvy = "athletic"
VAR cleavage = "skin"
VAR morgan_handsome = "fine"

// Stats
VAR ruthlessness = 50
VAR aggression = 50
VAR meekness = 50
VAR pride = 50
VAR intelligence = 5
VAR combat = 5
VAR strength = 5
VAR agility = 5
VAR Ramiel = 10

// Chapter 1 Logic Flags
VAR ignored_call = false
VAR accidental_shot = false
VAR meet_morgan = false


// --- STARTUP LOGIC ---

-> startup

=== startup ===
<b><i>Voice speaking indistinctly</i></b>

<i>You will encounter certain side characters in the form of foes, friends and rivals. You are allowed to form romances, partnerships and friendships with these characters as you play through. These characters can have varied genders (male, female and non-binary).</i>

How would you like these genders to be set?

* [Randomize the genders of these side characters (Recommended)]
    -> morgan_random
* [Pick a single gender for these side characters]
    All side characters with variable genders will be:
    ** [Male]
        -> set_morgan_male
    ** [Female]
        -> set_morgan_female
    ** [Non-binary]
        -> set_morgan_nonbinary


=== morgan_random ===
~ temp rand_roll = RANDOM(1, 3)
{ rand_roll:
    - 1: -> set_morgan_male
    - 2: -> set_morgan_female
    - 3: -> set_morgan_nonbinary
}

=== set_morgan_male ===
~ morgan_he = "he"
~ morgan_him = "him"
~ morgan_his = "his"
~ morgan_hers = "He"
~ morgan_title = "Mr."
~ morgan_child = "son"
~ morgan_male = "male"
~ morgan_man = "man"
~ morgan_fine = "handsome"
~ morgan_boy = "boy"
~ curvy = "muscular"
~ cleavage = "chest"
~ morgan_handsome = "handsome"
~ morgan_name = "Morgan"
Side characters are now set to male.
* [Continue]
    # clear
    -> name_setup

=== set_morgan_female ===
~ morgan_he = "she"
~ morgan_him = "her"
~ morgan_his = "her"
~ morgan_hers = "She"
~ morgan_title = "Miss"
~ morgan_child = "daughter"
~ morgan_male = "female"
~ morgan_man = "woman"
~ morgan_fine = "pretty"
~ morgan_boy = "girl"
~ curvy = "curvy"
~ cleavage = "cleavage"
~ morgan_handsome = "beautiful"
~ morgan_name = "Morgana"
Side characters are now set to female.
* [Continue]
    # clear
    -> name_setup

=== set_morgan_nonbinary ===
~ morgan_he = "they"
~ morgan_him = "them"
~ morgan_his = "their"
~ morgan_hers = "They"
~ morgan_title = "Mx."
~ morgan_child = "child"
~ morgan_male = "person"
~ morgan_man = "person"
~ morgan_fine = "fine"
~ morgan_boy = "Mx"
~ curvy = "athletic"
~ cleavage = "skin"
~ morgan_handsome = "fine"
~ morgan_name = "Morgano"
Side characters are now set to non-binary.
* [Continue]
    # clear
    -> name_setup


=== name_setup ===
<i>And what about you? Even the lesser gods knows their name. Who are you?</i>
Enter your name below. # input: player_name
-> surname_setup

=== surname_setup ===
# clear
<i>What is your surname?</i> # input: surname
-> playergender

=== playergender ===
# clear
The devil is a man, the devil is a woman, gender mean little to devils, demons and gods alike but are considered important to humans in the 3rd dimension.

You are…
* [a Man]
    -> player_male
* [a Woman]
    -> player_female
* [an Individual]
    -> player_nonbinary

=== player_male ===
~ gender = "Male"
~ player_he = "he"
~ player_him = "him"
~ player_his = "his"
~ player_boy = "boy"
~ player_man = "man"
~ player_sibling = "brother"
~ player_mr = "Mr"
~ player_child = "son"
-> enter_chapter_1

=== player_female ===
~ gender = "Female"
~ player_he = "she"
~ player_him = "her"
~ player_his = "her"
~ player_boy = "girl"
~ player_man = "woman"
~ player_sibling = "sister"
~ player_mr = "Mrs"
~ player_child = "daughter"
-> enter_chapter_1

=== player_nonbinary ===
~ gender = "Individual"
~ player_he = "they"
~ player_him = "them"
~ player_his = "their"
~ player_boy = "student"
~ player_man = "person"
~ player_sibling = "sibling"
~ player_mr = "Mx"
~ player_child = "child"
-> enter_chapter_1

=== enter_chapter_1 ===
<i>Before the first demon crawled from the pit, there was an angel who asked a forbidden question</i>  ~ Unknown
# image: rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1772975166254_ana-borquez--iLuIPyMSDY-unsplash.jpg
* [Chapter 1]
    # clear
    -> chapter_1_start

=== chapter_1_start ===
<b>CHAPTER 1</b>
The thick fog makes it difficult to see, but you can tell there are people chasing you in the distance, so you run. They shout you down, ordering you to stop; their language is strange, yet it sounds familiar. You take a quick look at yourself. Something is different about you. You look beaten down, bloodied, and injured, but even with your injuries, you still move with incredible speed. The gap between you and your pursuers seems to be increasing until suddenly, you reach the end of the road.

Your pursuers finally catch up to you and pull out their weapons.

"<i>It's over Ramiel,</i>" one of them says. "<i>Surrender now, and Cirac will be merciful,</i>" he proclaims confidently.

Your name is not Ramiel, why are they calling you by that name?

How do you reply?

* ["Who is Ramiel?"]
    ~ intelligence = intelligence + 5
    -> intro_run1
* ["What the hell are you talking about?"]
    ~ aggression = aggression + 7
    -> intro_run2
* ["Please spare me."]
    ~ meekness = meekness - 7
    -> intro_run3

=== intro_run1 ===
One of your pursuers steps forward. He is tall and muscular, but the thick fog makes it difficult to see his face. 

"<i>You will deny even your name? How low can you go, Ramiel?</i>" He spits with scorn and utters a phrase in a celestial tongue that you somehow understand. “Caelum contemptus!” (“Heaven frowns upon your audacity!”)
-> intro_run_contd

=== intro_run2 ===
One of your pursuers steps forward. He is tall and muscular, but the thick fog makes it difficult to see his face. 

"<i>Prideful and unrepentant until the very end… You never change, Ramiel.</i>" He spits with scorn and utters a phrase in a celestial tongue that you somehow understand. “Caelum contemptus!” (“Heaven frowns upon your audacity!”)
-> intro_run_contd

=== intro_run3 ===
One of your pursuers steps forward. He is tall and muscular, but the thick fog makes it difficult to see his face. 

"<i>Ramiel begging for mercy? Oh, how far thou art fallen.</i>" He spits with scorn and utters a phrase in a celestial tongue that you somehow understand. “Caelum contemptus!” (“Heaven frowns upon your audacity!”)
-> intro_run_contd

=== intro_run_contd ===
Another one steps forward with a sharp-looking sword extended in front of him. "<i>The heavens themselves would sooner fall than we let you live today, Ramiel. Your sins are too great, and the damage you have caused leaves us no choice but to put you down,</i>" he says as he approaches with caution.

"<i>Seee youu in HELL,</i>" he blurts out when he is within striking distance and raises his sword for the killing blow, but just then, a blinding white light appears. 

* [Wake UP]
    # clear
    -> wake_up

=== wake_up ===
You wake up from the weirdest dream, feeling dizzy and awkward, your head pounding. You step out of your bed to go take some painkillers. Walking feels hard, like there's a heavy load on your back. You check your time: 6:12 A.M. 

It's just Tuesday, but you're already feeling worn out. The thought of calling your boss to take a sick day crosses your mind, but you suppress it. You had already been on sick leave last week, and they made it clear it was the last one this month.

The loud ringing of your phone jolts you out of your thoughts. You pick it up and look at the screen; it's an unsaved number.

* [Answer the call]
    ~ pride = pride - 7
    -> answer_call_1
* [Do not take the call]
    ~ pride = pride + 7
    You toss the phone back into a pile of clothes you were planning on washing this weekend. Probably a wrong number. You swallow the painkillers just as the call dies. There is about a minute of silence, then the ringing starts again. 
    ** [Answer the call]
        ~ pride = pride - 3
        -> answer_call_2
    ** [Ignore the call still]
        ~ pride = pride + 3
        ~ ignored_call = true
        You ignore it until it dies. A few minutes of silence pass, nothing. Satisfied that the caller finally gave up, you turn to head to the bathroom, when the ringing starts again. 
        This time around, you pick up angrily, ready to vent your anger on whoever is on the other end.  
        -> answer_call_3

=== answer_call_1 ===
You answer the call, and Abigail, your boss, speaks urgently from the other end.

"<i>{player_name}, we got a 911 call from an apartment a few blocks away from you. You're the closest response unit, so head over there. The caller's talking about her husband acting possessed and says she's hurt bad. Just go check it out before coming to the office, that's what you're paid to do isn't it? If anything seems off, call for backup. Hopefully, it's not just a prank,</i>" she instructs before hanging up without giving you a chance to respond.

You stare at the phone for a while, taking a moment to collect your thoughts. You're not sure whether to be calm or cry. A long sigh is all you can manage.

<i>"What I'm paid to do? Yeah sure, as if checking out prank calls is part of my job,"</i> you mutter sarcastically, fighting the urge to call back and curse her out. Your phone chimes as a text message comes in from Abigail containing the 911 caller's address. It's that deserted street you always pass on your way to work. You quickly go about your morning duties and prepare to leave.
* [Outside]
    # clear
    -> outside

=== answer_call_2 ===
You answer the call, and Abigail, your boss, speaks urgently from the other end.

"<i>Took you so long to pick up {player_name}, I was about to hang up and you know what that means. Anyway, we got a 911 call from an apartment a few blocks away from you. You're the closest response unit, so head over there. The caller's talking about her husband acting possessed and says she's hurt bad. Just go check it out before coming to the office, that's what you're paid to do isn't it? If anything seems off, call for backup. Hopefully, it's not just a prank,</i>" she instructs before hanging up without giving you a chance to respond.

You stare at the phone for a while, taking a moment to collect your thoughts. You're not sure whether to be calm or cry. A long sigh is all you can manage.

<i>"What I'm paid to do? Yeah sure, as if checking out prank calls is part of my job,"</i> you mutter sarcastically, fighting the urge to call back and curse her out. Your phone chimes as a text message comes in from Abigail containing the SOS caller's address. It's that deserted street you always pass on your way to work. You quickly go about your morning duties and prepare to leave.
* [Outside]
    # clear
    -> outside

=== answer_call_3 ===
Abigail, your boss, shouts loudly from the other end.

"<i>BLOODY HELL {player_name} DO YOU NOT PICK UP CALLS ANYMORE? I BLOODY HELL HOPE YOU'RE NOT STILL ASLEEP, YOU BETTER NOT BE LATE TO WORK TODAY FOR DAMNED SAKE. WE GOT A 911 CALL FROM AN APARTMENT A FEW BLOCKS AWAY FROM YOU. YOU'RE THE DAMNED CLOSEST RESPONSE, SO HEAD OVER THERE. THE CALLER'S TALKING ABOUT HER HUSBAND ACTING POSSESSED AND SAYS SHE'S HURT BAD. JUST GO CHECK IT OUT BEFORE COMING TO THE OFFICE, THAT'S WHAT YOU'RE BLOODY HELL PAID TO DO AIN'T IT? IF ANYTHING SEEMS OFF, BLOODY HELL CALL FOR BACKUP. I HOPE IT'S A PRANK CALL SO THEY WASTE YOUR TIME JUST AS YOU'VE BLOODY HELL WASTED MINE.</i>" 

You hear someone trying to calm her down from the other end. 

"<i>NAH YOU TELL THAT TO {player_name}. I HATE LAZY PEOPLE,</i>" she barks before hanging up without giving you a chance to respond.

You stare at the phone for a while, taking a moment to collect your thoughts. You're not sure whether to be calm or cry. A long sigh is all you can manage.

<i>"What I'm paid to do? Yeah sure, as if checking out prank calls is part of my job,"</i> you mutter sarcastically, fighting the urge to call back and curse her out. Your phone chimes as a text message comes in from Abigail containing the SOS caller's address. It's that deserted street you always pass on your way to work. You quickly go about your morning duties and prepare to leave.
* [Outside]
    # clear
    -> outside

=== outside ===

The morning air is very chilly. As much as you try to avoid remembering it, it reminds you of the cold, helpless, suffocating feeling you experienced during your weird dream. You climb into your car and start it. The engine turns over with a reluctant groan that mirrors your own. As you pull out of the driveway, the world is covered in a grey, post-rain haze that makes the streetlights look like they are thumbprints against the sky.

You grip your steering wheel very tightly. Every mile feels like a marathon today. You find yourself checking the rearview mirror more than usual, half-expecting to see a tall, muscular figure in the fog instead of a suburban sedan. 

"<i>C'mon, yo, get it together,</i>" you mutter as you rub your temples. "<i>It was just a dream.</i>"

But the reality isn't much better. Your workplace, 'Metropolitan Emergency Dispatch & Response,' is less of a career. In fact, now that you think of it, it's more of a slow-motion car crash. Your office is a cramped, windowless room that is tucked away in a converted warehouse with the rest of the building. It smells of coffee and burnt electronics.

Then there’s Abigail. 

She runs the unit like a drill sergeant who lost her manual and then decided to just wing it with pure spite. To her, employees are not people. She doesn't treat them like people at all—more like assets to be deployed until they break. She has a way of making "protect and serve" sound like "shut up and do what I say." 

{ ignored_call:
    Your ears are still ringing from her shouting. You can practically see her red-faced glare through the phone. The same red face she wears when she paces the office floor in those clicking heels that signal everyone to look busy or face the consequences.
    -> outsidehouse_contd
- else:
    Her cold tone is worse than when she's shouting, sometimes. 
    -> outsidehouse_contd
}

=== outsidehouse_contd ===
How did you even end up working for someone like her? You weren't always stuck at the bottom of the dispatch ladder. Before this dead-end job sucked the life out of you, your path looked a lot different. 

You remember your days in...
* [The university. I spent years studying and sharpening my mind.]
    ~ intelligence = intelligence + 20
    You were always the analytical type, buried in books and lectures. You might not be the most physically intimidating person in the room, but you notice patterns and details that others miss. Too bad a degree doesn't protect you from Abigail's yelling.
    -> past_skill
* [The police academy. I was trained for the frontline before things went sideways.]
    ~ combat = combat + 15
    ~ strength = strength + 5
    You learned how to handle weapons and take down suspects. You washed out before you could get the badge, but the tactical training and combat drills are permanently hardwired into your brain.
    -> past_skill
* [A sports scholarship. I was an athlete, always pushing my physical limits.]
    ~ agility = agility + 15
    ~ strength = strength + 5
    Track, field, the adrenaline of the sprint. You were built for speed and endurance. The scholarship fell through, but your reflexes and stamina are still top-tier.
    -> past_skill
* [The streets. I didn't have time for school; I had to learn how to survive.]
    ~ agility = agility + 10
    ~ intelligence = intelligence + 10
    You learned everything you know from the school of hard knocks. You know how to read people, how to slip out of a bad situation, and how to keep yourself alive when things get rough.
    -> past_skill

=== past_skill ===
Despite the soul-crushing routine of the dispatch office, you've managed to keep yourself from completely rusting away. To blow off steam and deal with the stress of the city, you took up...
* [Boxing and mixed martial arts. I hit the bags until my knuckles bleed.]
    ~ combat = combat + 15
    ~ agility = agility + 5
    There's nothing quite like the focus of a fight. You know how to throw a hook, slip a jab, and put someone on the ground. It's the only time your mind feels truly quiet.
    -> back_to_drive
* [Heavy weightlifting. I push my body to lift more every single day.]
    ~ strength = strength + 20
    The iron doesn't lie, and it doesn't yell at you like Abigail does. You've built dense, functional muscle. When it comes to raw power, you can hold your own against almost anyone.
    -> back_to_drive
* [Parkour and urban running. I like to keep moving.]
    ~ agility = agility + 20
    You don't just run; you navigate the city like an obstacle course. Vaulting fences, climbing fire escapes, and maintaining your balance on narrow ledges keeps you agile and constantly on your toes.
    -> back_to_drive
* [Reading up on criminology and cold cases. I prefer mental exercises.]
    ~ intelligence = intelligence + 20
    Your body might be resting, but your brain is always working. You analyze crime scenes, study human behavior, and piece together puzzles in your spare time. You know how criminals think.
    -> back_to_drive

=== back_to_drive ===
The GPS pings, snapping you back to the present. You're turning onto the deserted street Abigail mentioned. The houses here are older and a little further from the road. Many of them are hidden behind overgrown bushes and signs that say "No Trespassing." 

It’s the kind of place where things go to stay hidden. You slow down and begin scanning for the house number. You feel that heavy load on your back return.

Something about this street feels far too much like the end of the road in your dream.

As you drive through this deserted street Abigail mentioned, how do you feel about this "911 call"?

* [I’m just here for the paycheck. Do the job, get out.]
    You will just focus on the protocol. Check the perimeter, talk to the witness, file the report. If Abigail wants to waste company time on domestic squabbles, that's her budget and her business, not yours.
    -> arrival
* [This feels wrong. The dream, the call... something is coming.]
    For some reason, you can't just shake off the feeling that something is not right. Maybe it's the way the streetlights flicker, you're not sure. But something tells you this isn't just a "husband acting possessed." The whole thing feels like a pattern you don't want to recognize.
    -> arrival
* [I'm reaching my breaking point. One more "prank" and I'm quitting.]
    You grip your steering wheel until your knuckles turn white. You're a first responder, not a babysitter for Abigail and her desires. If this is another false alarm, you're driving straight past the office and never looking back.
    -> arrival

=== arrival ===
The GPS pings: <i>"You have arrived at your destination."</i>

The house number is 412. It is an old Victorian-style building with white paint that is already starting to peel. The front yard is a chaotic mess of overgrown weeds, and there is a discarded tricycle that has been overturned in the dirt. There are no lights on inside, except for a flickering television in the upstairs window.

You park by the curb and leave the engine running. The street is very quiet. There are no birds, no distant traffic, nothing. The only other sound you hear is the ticking of your cooling radiator.

As you step out of the car, you notice the front door of the house is slightly open. 

A small thumping is coming from inside. *Thump. Thump. Thump.* It sounds like someone, or something, is hitting a wall with rhythm.

"Dispatch, this is Unit 7," you whisper into your shoulder mic, though you're not sure if Abigail is even listening. "I'm on-site at 412 Jonathan Street. I am now proceeding into the building with caution."

There’s no response but static.

* [Enter the House]
    # clear
    -> enter_house


=== enter_house ===
You walk slowly and lightly. There is dried blood on the floor that smells bad, which makes your throat itch. 

You move through the first three rooms. They are normal; in one of them you find a half-eaten bowl of soup, a knitting basket, and a framed photo of a smiling couple. It feels like the life in this house was interrupted suddenly.

Then you reach the hallway that leads to the back. You begin to hear whimpering. It’s high-pitched, like a wounded animal. It's coming from behind the fourth door.

Your heart is beating fast. You draw your service weapon and reach for the knob. It's locked.

The door won't budge. You throw your shoulder into it, but it feels like hitting a brick wall. The whimpering turns into a wet, choking sound.

* [Shoot the lock and kick the door in.]
    ~ accidental_shot = true
    ~ aggression = aggression + 5
    "<i>This has gone too far,</i>" you growl. You don't have time for finesse. You aim at the lock and fire twice. The <b>BANG! BANG!</b> is deafening. You follow up with a desperate, heavy kick.
    -> door_breached
* [Try to reason with whoever is inside first.]
    ~ accidental_shot = true
    ~ aggression = aggression - 5
    "<i>Police! I'm here to help!</i>" you shout. "<i>Open the door!</i>" You shout again when there is no response. The only response is a frantic scratching against the wood, as if fingernails are being used to write on a chalkboard. You realize they aren't going to open it. You fire at the lock and slam your weight against the wood.
    -> door_breached
* [Ram the door with pure adrenaline.]
    { strength >= 20:
        You don't want to use your gun yet. You tuck your chin and slam into the door with everything you have. The wood splinters, and the lock gives way with a sickening crack.
        -> door_breached
    - else:
        ~ accidental_shot = true
        You don't want to use your gun yet. You tuck your chin and slam into the door with everything you have, but it feels like hitting a solid brick wall. Pain immediately shoots up your shoulder, and the door barely even rattles. You stumble backward, cursing under your breath.
        
        Realizing your brute strength isn't going to cut it, you have no choice but to draw your service weapon. "<i>Stand back!</i>" you shout, though you doubt anyone inside is listening. You take aim at the lock and fire a single round. 
        
        <b>BANG!</b>
        
        The deafening noise rings in the narrow hallway. You follow up with a heavy kick, and this time, the splintered wood gives way.
        -> door_breached
    }

=== door_breached ===
* [HORROR]
    # clear
    -> horror_reveal
    
    
    
=== horror_reveal ===

The door flings wide open, and the scene before you makes your stomach turn. 

The room is painted in red. There is a woman huddled in the corner. Her clothes are torn, and she is staring at the center of the room with unblinking, glassy eyes. 

{ accidental_shot:
    A fresh patch of crimson is quickly spreading across the sleeve of her shirt. Your bullet must have passed right through the flimsy wood of the door and clipped her arm. Yet, she doesn't scream. She barely even registers the gunshot wound. The only sound she lets out is a low, wet whimper as she continues to stare blankly ahead.
}

But she isn't the source of the thumping.

Her husband, or whatever is left of him, is suspended two feet off the ground. No wires, no platform. He is levitating, floating.

He turns his head 180 degrees to look at you. His eyes aren't human; they are glowing white, exactly like the light from your dream, and he has an extra arm that protrudes from his waist area. 

"<i>Ramiel...</i>" the creature speaks, the voice sounding like thirty people speaking at once. "<i>You cannot hide in the skin of a mortal forever.</i>"

It takes everything in you to stop yourself from pissing yourself on the spot.

* [Fire your weapon.]
    ~ aggression = aggression + 5 
    -> combat_start
* [Try to grab the woman and run.]
    ~ ruthlessness = ruthlessness - 5
    -> rescue_attempt
* [Demand to know how he knows that name.]
    ~ pride = pride + 5
    -> interrogation


=== combat_start ===
You need no further green light. 

<b>BANG! BANG! BANG! BANG! BANG! BANG! BANG! BANG!</b> 

You squeeze the trigger, emptying the entire magazine at him. The gunshot is a thunderclap in the small room, but the possessed husband or monster, whatever he is, is quick. He charges at you and closes the gap in half a second. He swipes at you with his right arm. It hits you square in the chest; the impact feels like a car was flung at you. You fly several paces backward and land with a thud.
                                
There is a stinging pain, as if every bone in your chest is broken. You cough twice, spitting dark blood from your mouth. The man approaches you, intending to finish you off. 
-> combat_sequence

=== rescue_attempt ===
You lunge for the woman, intending to shield her and bolt for the door. But as your hand reaches for her shoulder, the possessed husband or monster, whatever he is, is quick. He charges at you and closes the gap in half a second. He swipes at you with his right arm. It hits you square in the chest; the impact feels like a car was flung at you. You fly several paces backward and land with a thud.
                                
There is a stinging pain, as if every bone in your chest is broken. You cough twice, spitting dark blood from your mouth. The husband approaches you, intending to finish you off. 
-> combat_sequence

=== interrogation ===
"<i>How do you know that name?</i>" you shout with the only trembling voice you can manage. "<i>Wh-who is… who is Ramiel?</i>"

The man’s jaw opens further than humanly possible as he speaks again. "<i>The scent of the fallen issss unmistakable,</i>" he hisses. "<i>Even wrapped in thissss... filth. I can smell you from milesss away…</i>"

Without warning, he lunges at you. Instinctively, you fire at him, but the possessed husband or monster, whatever he is, is quick. You only manage one shot before he closes the gap in half a second and bats your weapon aside. He swipes at you with his right arm. It hits you square in the chest; the impact feels like a car was flung at you. You fly several paces backward and land with a thud.
                                
There is a stinging pain, as if every bone in your chest is broken. You cough twice, spitting dark blood from your mouth. The man approaches you, intending to finish you off. 
-> combat_sequence


=== combat_sequence ===
"<i>Crozone iste scantum la bushhhhh Ramiel.</i>" The monstrous creature mocks you in the same celestial tongue from your dreams ("You have grown weak, Ramiel").

He towers over you as he draws closer. He doesn't move like a man. More like a glitch in reality. One moment he is across the room, the next he is standing over you. He slaps you with a backhand that feels like being hit by a freight train before finally picking you up by the neck. He smiles as he starts to squeeze. 

Immediately, your windpipe closes, and your vision starts to swim, the edges of your world now turning black. You try to raise your gun again, but he crushes your wrist with his third arm. You manage a squeal as the bone snaps.

His smile widens even more. It seems like this is the end. But at that moment, you feel a presence leaving you. That heavy weight you've felt on your back all morning since you woke up suddenly feels light. From the corner of your eye, you see your own shadow grow, become larger, and take form. 

* [Rise]
    # clear
    -> rise

=== rise ===
The shadow doesn't look like you one bit. It rises, towering and majestic, with what looks like two tattered wings. You're not sure if it is out of instinct or intuition, but the monstrous creature quickly drops you. One thing is clear: its eyes show no fear.

You fall to the ground with a soft thud, only half-conscious.

"<i>I do nottt fearrr you Ramiel. You have fallennn sooo far from graceeee you no longer possessss the power you onceee had.</i>"

"<i>Be Silent, Messenger.</i>" The shadow, which you assume is Ramiel, replies with a voice that carries the weight of eons. It lunges at the monstrous husband, and there is a sequence of actions which are too quick for your weak eyes to follow as you pass out.

* [Into The Void]
    # clear
    -> into_the_void

=== into_the_void ===
It's the same nightmare you've been having the past few days: thick fog, people chasing you, the end of the road. They call you Ramiel, and just when the killing blow descends, the blinding white light appears. 

But this time, you do not wake. 

-> void_awakening

=== void_awakening ===
You open your eyes; you lie face down in the sand. You feel tired, like all the strength was sapped from you, and every movement feels like twice the effort it should take. Gradually, you summon the strength to rise and scan your surroundings. You're in the middle of a huge desert that stretches as far as the eye can see. It seems endless. The only other thing you see aside from sand is a mighty tree a few miles away. Or perhaps only yards; distance is hard to judge here. Everywhere is completely and utterly silent. The only sound you hear is the distant howl of the wind. 

"<i>Another dream within a dream?</i>" you wonder.

Nearby, a small water puddle shimmers under the sunlight. You catch sight of your reflection in its rippling surface. 

You run a hand through your...
* [black hair]
    ~ hair = "black"
    -> colorofeye
* [grey hair]
    ~ hair = "grey"
    -> colorofeye
* [brown hair] 
    ~ hair = "brown"
    -> colorofeye
* [red hair]
    ~ hair = "red"
    -> colorofeye


=== colorofeye ===
You gaze a bit deeper into the water puddle, wondering about your reddish eyeballs. They are normally...
* [dark in color]
    ~ eyecolor = "dark"
    -> dream_contd
* [greyish] 
    ~ eyecolor = "greyish"
    -> dream_contd
* [brownish]
    ~ eyecolor = "brownish"
    -> dream_contd

=== dream_contd ===
You pat the dust off your clothes and begin walking towards the great tree. Its dark-colored trunk pierces the violet sky, and its leafless branches spread out like fractured lightning. It is the only living thing in this wasteland. As you get closer, you notice a man sitting at the foot of the tree. His legs are crossed in a meditative pose. He is dressed in tattered rags that might have once been a uniform, and his skin is covered in tiny, glowing scars like celestial engravings. 

You begin to approach him, stopping only when you are mere inches away from him. If he is aware of your presence, he doesn't show it. There is no movement from him, not even a twitch of a muscle. 

* ["Hello? Who are you? Is this another dream?"]
    You could swear the man's lips never move, but his voice still emanates from it. It's like it's coming from everywhere at once. 
    
    "<i>A dream is a luxury for the guiltless, a luxury I do not have,</i>" he says with a weary, sort of ironic tone. "<i>This… is my prison. You are the fabric, and I am the... history.</i>"
    
    He finally looks at you, and the sheer weight of his gaze nearly makes your knees buckle. It's like looking into a mirror that shows you who you were ten thousand years before you were even born.
    ~ intelligence = intelligence + 5
    -> ramiel_warning

* ["They called me Ramiel. Are you him?"]
    The man’s eyes snap open. They are reddish, just like yours when you looked into the puddle. Except his are glowing, like twin pits of dying starlight.
    
    He speaks. You could swear the man's lips never move, but his voice still protrudes from it. It's like it's coming from everywhere at once. 
    
    "<i>Ramiel is a title, a burden, and a curse.</i>" He stands up with a grace that is utterly non-human. "<i>You, little mortal, are the fabric.</i>"
    
    He towers over you.
    ~ Ramiel = Ramiel + 5
    -> ramiel_warning

* [Touch the man's shoulder to wake him.]
    ~ Ramiel = Ramiel + 5
    Just before your fingers make contact with his tattered robe, a jolt of pure, searing electricity surges through your arm, and you quickly pull your hand back in pain. But the pain is slowly followed by a cold, strange sensation.
    
    The man rises slowly. His movements are like a predator that has sensed a shift in the wind. "<i>Bold,</i>" he muses. "<i>Most would tremble. You chose to strike. Perhaps the fabric has more spirit than I gave it credit for.</i>"
    
    He towers over you.
    ~ aggression = aggression + 5
    -> ramiel_warning

=== ramiel_warning ===
"<i>Listen closely, fabric,</i>" he says, his voice suddenly becoming sharp and urgent. "<i>There are people on their way to you right now… my kind who have found the scent of my exile, and they are already seeding the ground around your waking body.</i>"

He steps closer, into your personal space. 

"<i>When you wake, you will be in a cage. There will be three of them. One is a man of law, blinded by his own rules. One is a wolf in silk, hungry for the fire. And the third... the third is a debt I am finally calling in.</i>"

He reaches out, his palm pressing against your chest right where the "heavy load" usually sits. 

"<i>Do not trust the laughter. And whatever you do, do not let them take you to the Second Location. If you enter, I cannot reach you. You will be erased.</i>"

Without warning, he shoves you violently, sending you tumbling backward into the sand. You sink through the floor of the world and keep falling until you begin to perceive the sharp, stinging smell of bleach and the hum of a hospital monitor.

* [Wake Up]
    # clear
    -> wake_up_hospital


=== wake_up_hospital ===
You jolt awake. Your heart is beating fast against your ribs. The smell of bleach and antiseptic is overwhelming, stinging your nostrils. 

As you try to rub your eyes, a sharp jerk stops your hand. A heavy iron cuff has been used to connect your right wrist to the bed rail. The metal is very cold.


You glance at the bedside table. In the middle of the plastic cups and medical tape sits a plain white envelope. It has no stamp. No return address. 

Just a name written in elegant, sharp cursive: <b>Morgan Third Choir</b>.

* [Open the letter.]
    You strain against the cuff as you reach for it, your fingertips just barely managing to snag the edge of the paper. You tear it open. Inside is a single sheet of paper.
    
    "<i>There are three coming for you. One is human. One is a hunter. One is mine. Watch the one who smiles too much.</i>"
    
    At the bottom of the paper is a word written in ancient celestial. You shouldn't be able to read it, but with all the recent happenings, you're not surprised you can. The word is:
    
    <i>srcium</i>
    
    Meaning: <i>Debt</i>
    -> agents_arrival
* [Leave the letter for now and call for a nurse.]
    Whatever is in that envelope, you aren't sure you're ready to read it. For now, you just try to focus on your breathing, until you're no longer hyperventilating. Then you call out.
    
    "<i>Hey! Someone!</i>" you rasp, your throat is dry. "<i>Anyone out there?</i>"
    -> agents_arrival


=== agents_arrival ===
~ meet_morgan = true
The door swings open with a heavy thud. A doctor enters, unhooks your IV without making eye contact, and slips out of the room as quickly as he can. 

Three men walk in, fanning out to block the exit.

"<i>Glad to see you're awake,</i>" the man in the center says. He’s wearing a sharp charcoal suit and has his badge clipped to his belt. "<i>I'm Agent Renshi, FBI. This is my partner, Agent Denver.</i>"

Denver, leaning against the wall, gives a short, tight grin. He's chewing gum aggressively.

Renshi then gestures slightly to the third {morgan_man} standing nearest to the door. There's a slight stiffness in Renshi's posture when he does it. "<i>And this is Agent MTC. Department of Justice, Special Interventions. {morgan_he} was attached to our unit this morning to oversee the... irregularities of your case.</i>"

Agent MTC offers you a brief, polite nod. {morgan_his} face is a mask of perfect, chilling calm. If Renshi is intimidated by the Department Of Justice oversight, Denver doesn't seem to care at all.

{ accidental_shot:
    "<i>Let's get straight to it,</i>" Renshi says, pulling out a notepad. "<i>The 911 call you responded to, the woman from the apartment… the wife… she gave a very detailed statement. She says you broke in, shot her in the arm while shouting some gibberish about a messenger. And as if that was not enough, you attacked her husband without provocation. She says she watched you empty all your clips on him and threw him through the window. She has a bullet wound on her arm to back her testimony.</i>"
- else:
    "<i>Let's get straight to it,</i>" Renshi says, pulling out a notepad. "<i>The 911 call you responded to, the woman from the apartment… the wife… she gave a very detailed statement. She says you broke in, shouted some gibberish about a messenger, and attacked her husband without provocation. She says you shot him and threw him through the window.</i>"
}
-> question_contd
    
=== question_contd ===
You are unable to hold back your surprise.

"<i>What? Where is he?</i>" are the first words that come out of your mouth instinctively.

"<i>That's the problem,</i>" Denver says with a smile. "There's a bloodstain on the pavement, but no body. Just a pile of... white ash. Yet the DNA test confirms it's him. You want to tell us how a local responder learns to turn people into dust? Did you burn him? Grind him perhaps?"

Renshi sighs. "<i>We're taking you to a secure facility for questioning. This isn't a request. You're under arrest for the suspected murder of David Miller.</i>"

How do you react?

* ["I want a lawyer. I'm not saying a word, and I'm not leaving this bed."]
    ~ pride = pride + 5
    -> ending_the_stall
* ["Alright. I'll go with you."] 
    ~ aggression = aggression - 5
    -> ending_the_elevator
* ["I know what you really are. I'm not going with you."]
    ~ aggression = aggression + 5
    -> ending_the_confrontation

=== ending_the_stall ===
"<i>I know my rights, and I want my lawyer,</i>" you state firmly as you lean back into the pillows. "<i>Until I have counsel present, I am not answering questions, and I am not waiving my right to medical observation.</i>"

Renshi frowns, looking at his notepad. "<i>You are a suspect in a federal murder investigation. You don't dictate the terms of your transfer.</i>"

"<i>Actually, he does,</i>" MTC says smoothly from the doorway. 

Renshi blinks, turning to look at the liaison agent. "<i>Excuse me?</i>"

"<i>The suspect has requested counsel and is currently under medical care,</i>" MTC states with a perfectly level voice. "<i>Department Of Justice protocol strictly prohibits unauthorized transport under these conditions…. We wait.</i>"

Denver's smile vanishes. "<i>Your protocol means nothing here. We are taking him now.</i>"

He steps toward your bed. At first, you assume he wants to bring out the key to your cuffs, but the way he looks at you... There is suddenly no warmth in his eyes. It's like they've turned into cold, dead glass.

<b>BANG!</b>

Denver fires his weapon through his suit, and Renshi falls, dead before he hits the ground. He turns to MTC next. 

<b>BANG! BANG!</b>

But MTC is already moving. {morgan_he} moves so fast that it looks like a glitch in reality. {morgan_he} slips a dark, notched dagger from {morgan_his} sleeve and drives it up under Denver’s ribs, piercing the heart. 

Denver gasps in surprise. His body flashes with a blinding inner light before he collapses into a pile of smoking white ash on the hospital floor.

MTC adjusts {morgan_his} tie, looking at the ash, then down at the dead Renshi. {morgan_he} steps over to your bed and casually snaps your handcuffs with one hand. "<i>Very professional of you to invoke your rights,</i>" MTC says dryly. "<i>I'm MTC, short for Morgan Third Choir… We have to go.</i>"

"<i>Can you walk, or do I need to carry you?</i>"
* [Chapter 2]
    # clear
    -> chapter2


=== ending_the_elevator ===
"<i>Fine,</i>" you say, forcing yourself to be brave. "<i>I have nothing to hide. Let's go.</i>"

Renshi nods. "<i>Smart choice. Denver, get him ready.</i>"

Denver steps forward, unhooking your right hand from the bed rail and quickly snapping a fresh pair of heavy steel cuffs onto both your wrists. He’s rough about it a bit.

You walk out of the room and down the sterile hospital corridor; the fluorescent lights are buzzing above you. MTC follows a few paces behind, silent as a shadow. You step into the empty elevator. Renshi hits the button for the basement parking garage. 

The doors slide shut. 

As the elevator descends, Renshi watches the floor numbers tick down. Denver is standing right beside you, chewing his gum.

"<i>You know, this would be a lot easier if you just confess on the ride down,</i>" Denver remarks casually.

Renshi sighs. "<i>Denver, save it for the interrogation room.</i>"

"<i>I don't think he's going to make it to the room, Renshi,</i>" Denver replies. 

Renshi turns, frowning. "<i>What are you talking about…</i>"

<b>BANG!</b>

The gunshot is deafening in the confined metal box. Renshi slumps against the elevator wall. There is a bullet hole right between his eyes, dead before he hits the floor. 

There is suddenly no warmth in Denver's eyes. It's like they've turned into cold, dead glass. He racks the slide of his weapon and turns the barrel toward MTC's chest.

But MTC is already moving. {morgan_he} moves so fast {morgan_he} looks like a glitch in the security camera. {morgan_he} slips a dark, notched dagger from under {morgan_his} sleeve and drives it upward, burying it deep into Denver’s heart.

Denver gasps in surprise. His body flashes with a blinding inner light before he collapses into a pile of smoking white ash.

MTC adjusts {morgan_his} tie, looking at the ash, then down at the dead Renshi. {morgan_he} steps over to you and casually snaps your steel handcuffs with one hand. 

"<i>Well, that accelerates the timeline,</i>" MTC says dryly. "<i>I'm MTC, short for Morgan Third Choir… We have to go.</i>"

"<i>Can you walk, or do I need to carry you?</i>"
* [Chapter 2]
    # clear
    -> chapter2



=== ending_the_confrontation ===
You sit forward, your cuffs rattling against the bed rail. You look directly at Renshi and Denver. "<i>I know what you are,</i>" you state coldly, bluffing through the adrenaline. "<i>And I know what that 'secure facility' is. I'm not going anywhere.</i>"

Renshi scoffs, shaking his head. "<i>Look, kid, you don't have a choice. You're a murder suspect, you're going into federal custody.</i>"

"<i>I said no,</i>" you press and lock eyes with each of them, one by one. You don't know for sure who the bad one is, but you want to see who flinches first. 

Denver stops chewing his gum. He looks at you for a long, silent moment. There is suddenly no warmth in his eyes. It's like they've turned into cold, dead glass.

"<i>You're coming with us, or you will die where you stand,</i>" Denver declares.

Renshi looks at his partner in confusion. "<i>Die where he… Denver, what are you doing?</i>"

<b>BANG!</b>

Denver fires his weapon straight through his own suit pocket. Renshi drops to the hospital floor, and a fatal red bloom begins spreading from under his chest. 

Before you can even process the gunshot, Denver turns the weapon on MTC.

<b>BANG! BANG!</b>

Sparks shower the room, but MTC is already moving with a speed that defies reality. {morgan_he} slips out a dark, notched dagger from {morgan_his} sleeve and without missing a beat, lunges forward and drives the dark blade straight through Denver's chest, piercing the heart. 

Denver gasps in surprise. His body flashes with a blinding inner light before he collapses into a pile of smoking white ash on the hospital floor.

MTC adjusts {morgan_his} tie, looking at the ash, then down at the dead Renshi. {morgan_he} steps over to your bed and casually snaps your handcuffs with one hand. 

"<i>Very bold of you to force his hand,</i>" MTC says dryly. "<i>I'm MTC, short for Morgan Third Choir… We have to go.</i>"

"<i>Can you walk, or do I need to carry you?</i>"
* [Chapter 2]
    # clear
    -> chapter2

=== chapter2 ===
# clear
<b>THANK YOU FOR PLAYING</b>

Thanks for playing Chapter 1 of Supernatural Fugitive! If you loved this, my massive 193,000-word flagship game, <b>Keeper's Vigil</b>, is launching on Steam in Q2 2026. 

Join the Lota Labs waitlist to be the first to know when it drops.

* [Join the Waitlist & Read Devlogs]
    # url: /blog
    -> DONE
