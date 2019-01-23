Qhack
Author: voyti (voytidev@gmail.com)

-- RUNNING THE GAME --

Host contents of the dist folder

-- MANUAL --

ENTER - proceed to next screen/attempt cracking master key if enough energy is stored
A-Z 0-1 - discover node if character matching both discoverable signatures and node signature
= (equals) - time warp for terminal text (experimental)
 - (minus) - mute/unmute music

TL;DR:

Crack master password of the Space Station Lima by powering up the Onboard Quantum Computer and launching a successful cracking attempt. To do that, unfold Station solar power arrays, leading your Boarding Party through the Space Station grid by discovering it node by node. 

Node discovery is done by pressing one of the listed Discoverable Signatures, which are alphanumeric characters, while it is displayed on a grid node. This will uncover the node. If the node is vulnerable to interfacing, the team will proceed to it to unfold one of 8 solar arrays the Station has access to.

The frequency selection will reflect how frequently the Signatures change in nodes. Higher frequency will allow faster grid discovery, but will also decrease the time when you can press matching button.

Weigh in your available charge, power inflow and remaining time and decide when to launch a cracking attempt, pressing ENTER. You can launch as many as necessary, as long as you reach the minimum charge, which is about 1/3 of the capacity. Keep in mind that any cracking attempt will deplete your collected charge.

-- BACKGROUND --

It’s year 2048, and it may become one of the most significant years to date in the human history. Hopefully, it won’t also be the last.

After significant increase of various low orbit incidents, NASA has released a recording from the ISS observation deck, showing objects that could not be explained as inert debris, but rather a propelled, maneuvering and likely extraterrestrial spacecraft. 

It triggered an uproar on Earth with mankind divided mainly between those who disbelieved, claiming the recording was forged, those who immediately acknowledged this revelation with excitement and the rest, waiting for answers and concerned for the fate of the civilization.

As the US Space Force Quantum Systems Officer you would rather know this much. The truth is more terrifying than just confirmed sighting of a UFO by a major organization. The truth is, it was most likely a deliberate attack on Earth’s defensive infrastructure, a Close Encounter of the Second Kind if you like that terminology.

Space Station Lima, one of two defensive Space Stations forming the Low Orbit Defense Grid (LODG) , was significantly damaged by some kind of EMP strike, likely mixed with strong radiation. Space is already a tough environment for circuitry, and this incident had to break all known limits for possible natural and human activity. 

The Station status is unknown, no contact could be made and the crew either evacuated or was killed during the incident. The Station purpose was early prevention of any threats that could originate from space and was equipped with experimental sensors that likely recorded data which importance is absolutely crucial in the face of this incident. The command is convinced this data was not damaged, as it was stored in a black-box like case capable of sustaining events up to a nuclear strike.

-- TASK --

Your task is to recover that data, which may require breaking the Master Password, since the Station system access is locked and key is likely damaged and will not match our stored keys. An unauthorized access attempt will trigger the emergency lockdown, wiping all data stores and decompressing the Station. The lockdown is delayed by 3 minutes, which is our window to power up the Onboard Quantum Computer (OQC) stationed on your Multipurpose Low Orbit Shuttle and attempt to break the key.

Fortunately, it seems that the station software architect did not follow the National Institute of Standards and Technology recommendation and used the outdated 2048-bit RSA, which should be quite breakable. Unfortunately, your MLOS is incapable of powering the OQC by itself, and the Station solar arrays were automatically folded to prevent any further damage. 
The Boarding Party will have to physically access vulnerable grid nodes on the Station and unfold the solar arrays. Your help will be required to do that, since the grid nodes need to be discovered one by one, in a specific power cycle phase. When a node is in the proper phase, you can access it and discover the node. If we’re lucky, this node will contain a solar array circuit, and the Boarding Party can use it to unfold the array. 

We have 8 arrays, in current state each giving us about 10kW. Once unfolded, they will count towards available power, loading the condensator. In time, we should have enough energy to attempt breaking the Master Key maybe twice, if we're lucky. Let’s get that data out of there in time!
