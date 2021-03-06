var Role = {
    Bodyguard: {
        name: "Bodyguard",
        canKill: true,
        abilitylimit: 1,
        team: "town",
        priority: 4,
        unique: false,
        cons_result: "Your target is a trained protector, they must be a Bodyguard.",
        invest_result: "Your target is not afraid to get their hands dirty. They could be: Bodyguard/Godfather/Arsonist",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Bodyguard.png",
            Alignment: "Town (Protective)",
            Abilities: "Protect one person from death each night.",
            Attributes: "If your target is attacked, both you and your attacker will die instead.\nIf you successfully protect someone, you can't be saved from death.\nYour counterattack ignores night immunity.",
            Goal: "Lynch every criminal and evildoer."
        }
    },
    Doctor: {
        name: "Doctor",
        canKill: false,
        abilitylimit: 1,
        team: "town",
        priority: 4,
        unique: false,
        cons_result: "Your target is a professional surgeon. They must be a Doctor.",
        invest_result: "Your target is covered in blood. They could be: Doctor/Disguiser/Serial Killer",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Doctor.png",
            Alignment: "Town (Protective)",
            Abilities: "Heal one person each night, preventing them from dying.",
            Attributes: "You may only heal yourself once.\nYou will know if your target is attacked.",
            Goal: "Lynch every criminal and evildoer."
        }
    },
    Escort: {
        name: "Escort",
        canKill: false,
        abilitylimit: 1000,
        team: "town",
        priority: 3,
        unique: false,
        cons_result: "Your target is a beautiful woman working for the town. They must be an Escort.",
        invest_result: "Your target is skilled at disrupting others. They could be: Escort/Transporter/Consort",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Escort.png",
            Alignment: "Town (Support)",
            Abilities: "Distract someone each night.",
            Attributes: "Distraction blocks your target from using their role's night ability.\nYou are immune to role blocks.\nIf you target a Serial Killer, they will attack you.",
            Goal: "Lynch every criminal and evildoer."
        }
    },
    Investigator: {
        name: "Investigator",
        canKill: false,
        abilitylimit: 1000,
        team: "town",
        priority: 5,
        unique: false,
        cons_result: "Your target gathers information. They must be an Investigator.",
        invest_result: "Your target has sensitive information to reveal. They could be: Investigator/Consigliere/Mayor",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Bodyguard.png",
            Alignment: "Town (Investigative)",
            Abilities: "Investigate one person each night for a clue to their role.",
            Attributes: "None",
            Goal: "Lynch every criminal and evildoer."
        }
    },
    Jailor: {
        name: "Jailor",
        canKill: true,
        abilitylimit: 3,
        team: "town",
        priority: 7,
        unique: true,
        cons_result: "Your target detains people at night. They must be a Jailor.",
        invest_result: "Your target knows your darkest secrets. They could be: Spy/Blackmailer/Jailor",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Jailor.png",
            Alignment: "Town (Killing)",
            Abilities: "You may choose one person during the day to jail for the night.",
            Attributes: "You may anonymously talk with your prisoner.\nYou may choose to execute your prisoner.\nThe jailed target cannot perform their night ability.\nWhile jailed the prisoner is safe from all attacks.",
            Goal: "Lynch every criminal and evildoer."
        }
    },
    Lookout: {
        name: "Lookout",
        canKill: false,
        abilitylimit: 1000,
        team: "town",
        priority: 9,
        unique: false,
        cons_result: "Your target watches who visits people at night. They must be a Lookout.",
        invest_result: "Your target sticks to the shadows. They could be: Lookout/Forger/Amnesiac",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Lookout.png",
            Alignment: "Town (Investigative)",
            Abilities: "Watch one person at night to see who visits them.",
            Attributes: "None",
            Goal: "Lynch every criminal and evildoer."
        }
    },
    Mayor: {
        name: "Mayor",
        canKill: false,
        abilitylimit: 1,
        team: "town",
        priority: 0,
        unique: true,
        cons_result: "Your target is the leader of the town. They must be the Mayor.",
        invest_result: "Your target has sensitive information to reveal. They could be: Investigator/Consigliere/Mayor",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Mayor.png",
            Alignment: "Town (Support)",
            Abilities: "You may reveal yourself as the Mayor of the Town.",
            Attributes: "Once you have revealed yourself as the Mayor your vote counts as 3 votes.\nYou may not be healed once you have revealed.",
            Goal: "Lynch every criminal and evildoer."
        }
    },
    Medium: {
        name: "Medium",
        canKill: false,
        abilitylimit: 1,
        team: "town",
        priority: 0,
        unique: false,
        cons_result: "Your target speaks with the dead. They must be a Medium.",
        invest_result: "Your target works with dead bodies. They could be: Medium/Janitor/Retributionist",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Medium.png",
            Alignment: "Town (Support)",
            Abilities: "Speak with a dead person at night.",
            Attributes: "You will speak to your target anonymously.",
            Goal: "Lynch every criminal and evildoer."
        }
    },
    Retributionist: {
        name: "Retributionist",
        canKill: false,
        abilitylimit: 1,
        team: "town",
        priority: 4,
        unique: true,
        cons_result: "Your target is a Retributionist.",
        invest_result: "Your target works with dead bodies. They could be: Medium/Janitor/Retributionist",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Retributionist.png",
            Alignment: "Town (Support)",
            Abilities: "You may revive a dead Town member.",
            Attributes: "You may only resurrect one person.",
            Goal: "Lynch every criminal and evildoer."
        }
    },
    Sheriff: {
        name: "Sheriff",
        canKill: false,
        abilitylimit: 1000,
        team: "town",
        priority: 5,
        unique: false,
        cons_result: "Your target is a protector of the town. They must be a Sheriff.",
        invest_result: "Your target is waiting for the perfect moment to strike. They could be: Sheriff/Executioner/Werewolf",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Sheriff.png",
            Alignment: "Town (Investigative)",
            Abilities: "Check one person each night for suspicious activity.",
            Attributes: "You will know if your target is a member of the Mafia, except for the Godfather.\nYou will know if your target is a Serial Killer.",
            Goal: "Lynch every criminal and evildoer."
        }
    },
    Spy: {
        name: "Spy",
        canKill: false,
        abilitylimit: 1000,
        team: "town",
        priority: 0,
        unique: false,
        cons_result: "Your target secretly listens in on private conversations. They must be a Spy.",
        invest_result: "Your target knows your darkest secrets. They could be: Spy/Blackmailer/Jailor",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Spy.png",
            Alignment: "Town (Investigative)",
            Abilities: "You can secretly listen to the Mafia at night.",
            Attributes: "You can hear private messages.\nYou will know who the Mafia visit at night.",
            Goal: "Lynch every criminal and evildoer."
        }
    },
    Transporter: {
        name: "Transporter",
        canKill: false,
        abilitylimit: 1000,
        team: "town",
        priority: 1,
        unique: false,
        cons_result: "Your target specializes in transportation. They must be a Transporter.",
        invest_result: "Your target is skilled at disrupting others. They could be: Escort/Transporter/Consort",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Transporter.png",
            Alignment: "Town (Support)",
            Abilities: "Choose two people to transport at night.",
            Attributes: "Transporting two people swaps all targets against them.\nYou may transport yourself.\nYour targets will know they were transported.",
            Goal: "Lynch every criminal and evildoer."
        }
    },
    VampireHunter: {
        name: "Vampire Hunter",
        canKill: true,
        abilitylimit: 1000,
        team: "town",
        priority: 5,
        unique: false,
        cons_result: "Your target tracks Vampires. They must be a Vampire Hunter!",
        invest_result: "Your target keeps to themselves. They could be: Survivor/Vampire Hunter/Witch",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/VampireHunter.png",
            Alignment: "Town (Killing)",
            Abilities: "Check for Vampires each night.",
            Attributes: "If you find a Vampire you will stake them in the heart.\nIf a Vampire visits you they will be staked.\nYou can hear Vampires at night.\nIf you kill all Vampires you will become a Vigilante.",
            Goal: "Lynch every criminal and evildoer."
        }
    },
    Veteran: {
        name: "Veteran",
        canKill: true,
        abilitylimit: 3,
        team: "town",
        priority: 9,
        unique: true,
        cons_result: "Your target is a paranoid war hero. They must be a Veteran.",
        invest_result: "Your target owns a gun. They could be: Vigilante/Mafioso/Veteran",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Veteran.png",
            Alignment: "Town (Killing)",
            Abilities: "Decide if you will go on alert.",
            Attributes: "While on alert you can not be killed at night.\nIf anyone visits you while you are on alert they will be shot.\nYou can only go on alert 3 times.\nYou are immune to role blocks.",
            Goal: "Lynch every criminal and evildoer."
        }
    },
    Vigilante: {
        name: "Vigilante",
        canKill: true,
        abilitylimit: 3,
        team: "town",
        priority: 7,
        unique: false,
        cons_result: "Your target will bend the law to enact justice. They must be a Vigilante.",
        invest_result: "Your target owns a gun. They could be: Vigilante/Mafioso/Veteran",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Vigilante.png",
            Alignment: "Town (Killing)",
            Abilities: "Choose to take justice into your own hands and shoot someone.",
            Attributes: "If you shoot another Town member you will commit suicide over the guilt.\nYou can only shoot your gun 3 times.",
            Goal: "Lynch every criminal and evildoer."
        }
    },
    Blackmailer: {
        name: "Blackmailer",
        canKill: false,
        abilitylimit: 1000,
        team: "mafia",
        priority: 4,
        unique: false,
        cons_result: "Your target uses information to silence people. They must be a Blackmailer.",
        invest_result: "Your target knows your darkest secrets. They could be: Spy/Blackmailer/Jailor",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Blackmailer.png",
            Alignment: "Mafia (Support)",
            Abilities: "Choose one person each night to blackmail.",
            Attributes: "Blackmailed targets can not talk during the day.\nIf there are no kill capable Mafia roles left you will become a Mafioso.\nYou can talk with the other Mafia at night.",
            Goal: "Kill anyone that will not submit to the Mafia."
        }
    },
    Consigliere: {
        name: "Consigliere",
        canKill: false,
        abilitylimit: 1000,
        team: "mafia",
        priority: 4,
        unique: false,
        cons_result: "Your target gathers information for the Mafia. They must be a Consigliere.",
        invest_result: "Your target has sensitive information to reveal. They could be: Investigator/Consigliere/Mayor",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Consigliere.png",
            Alignment: "Mafia (Support)",
            Abilities: "Check one person for their exact role each night.",
            Attributes: "If there are no kill capable Mafia roles left you will become a Mafioso.\nYou can talk with the other Mafia at night.",
            Goal: "Kill anyone that will not submit to the Mafia."
        }
    },
    Consort: {
        name: "Consort",
        canKill: false,
        abilitylimit: 1000,
        team: "mafia",
        priority: 3,
        unique: false,
        cons_result: "Your target is a beautiful woman working for the Mafia. They must be a Consort.",
        invest_result: "Your target is skilled at disrupting others. They could be: Escort/Transporter/Consort",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Consort.png",
            Alignment: "Mafia (Support)",
            Abilities: "Distract someone each night.",
            Attributes: "Distraction blocks your target from using their role's night ability.\nIf there are no kill capable Mafia roles left you will become a Mafioso.\nYou can talk with the other Mafia at night.",
            Goal: "Kill anyone that will not submit to the Mafia."
        }
    },
    Disguiser: {
        name: "Disguiser",
        canKill: false,
        abilitylimit: 3,
        team: "mafia",
        priority: 4,
        unique: false,
        cons_result: "Your target pretends to be other people. They must be a Disguiser.",
        invest_result: "Your target is covered in blood. They could be: Doctor/Disguiser/Serial Killer",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Disguiser.png",
            Alignment: "Mafia (Deception)",
            Abilities: "Choose a target to disguise yourself as.",
            Attributes: "If your target dies you will appear to be them.\nYou can only use your night ability three times.\nAfter disguising your name, position and character will be swapped with your targets.\nIf there are no kill capable Mafia roles left you will become a Mafioso.\nYou can talk with the other Mafia at night.",
            Goal: "Kill anyone that will not submit to the Mafia."
        }
    },
    Forger: {
        name: "Forger",
        canKill: false,
        abilitylimit: 3,
        team: "mafia",
        priority: 4,
        unique: false,
        cons_result: "Your target forges documents. They must be a Framer or Forger.",
        invest_result: "Your target sticks to the shadows. They could be: Lookout/Forger/Amnesiac",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Forger.png",
            Alignment: "Mafia (Deception)",
            Abilities: "Choose a person and rewrite their last will at night.",
            Attributes: "If your target dies their last will is replaced with your forgery.\nYou may only perform 3 forgeries.\nIf there are no kill capable Mafia roles left you will become a Mafioso.\nYou can talk with the other Mafia at night.",
            Goal: "Kill anyone that will not submit to the Mafia."
        }
    },
    Framer: {
        name: "Framer",
        canKill: false,
        abilitylimit: 1000,
        team: "mafia",
        priority: 4,
        unique: false,
        cons_result: "Your target forges documents. They must be a Framer.",
        invest_result: "Your target may not be what they seem. They could be: Framer/Vampire/Jester",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Framer.png",
            Alignment: "Mafia (Deception)",
            Abilities: "Choose someone to frame at night.",
            Attributes: "If your target is investigated they will appear to be a member of the Mafia.\nIf there are no kill capable Mafia roles left you will become a Mafioso.\nYou can talk with the other Mafia at night.",
            Goal: "Kill anyone that will not submit to the Mafia."
        }
    },
    Godfather: {
        name: "Godfather",
        canKill: true,
        abilitylimit: 1000,
        team: "mafia",
        priority: 6,
        unique: true,
        cons_result: "Your target is a leader of the mafia. They must be the Godfather.",
        invest_result: "Your target is not afraid to get their hands dirty. They could be: Bodyguard/Godfather/Arsonist",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Godfather.png",
            Alignment: "Mafia (Killing)",
            Abilities: "Kill someone each night.",
            Attributes: "You can't be killed at night.\nIf there is a Mafioso he will attack the target instead of you.\nYou will appear to be a Town member to the Sheriff.\nYou can talk with the other Mafia at night.",
            Goal: "Kill anyone that will not submit to the Mafia."
        }
    },
    Janitor: {
        name: "Janitor",
        canKill: false,
        abilitylimit: 3,
        team: "mafia",
        priority: 4,
        unique: false,
        cons_result: "Your target cleans up dead bodies. They must be a Janitor.",
        invest_result: "Your target works with dead bodies. They could be: Medium/Janitor/Retributionist",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Framer.png",
            Alignment: "Mafia (Deception)",
            Abilities: "Choose a person to clean at night.",
            Attributes: "If your target dies their role and last will won't be revealed to the town.\nOnly you will see the cleaned targets role and last will.\nYou may only perform 3 cleanings.\nIf there are no kill capable Mafia roles left you will become a Mafioso.\nYou can talk with the other Mafia at night.",
            Goal: "Kill anyone that will not submit to the Mafia."
        }
    },
    Mafioso: {
        name: "Mafioso",
        canKill: true,
        abilitylimit: 1000,
        team: "mafia",
        priority: 7,
        unique: true,
        cons_result: "Your target does the Godfather's dirty work. They must be a Mafioso.",
        invest_result: "Your target owns a gun. They could be: Vigilante/Mafioso/Veteran",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Mafioso.png",
            Alignment: "Mafia (Killing)",
            Abilities: "Carry out the Godfather's orders.",
            Attributes: "You can kill if the Godfather doesn't give you orders.\nIf the Godfather dies you will become the next Godfather.\nYou can talk with the other Mafia at night.",
            Goal: "Kill anyone that will not submit to the Mafia."
        }
    },
    Amnesiac: {
        name: "Amnesiac",
        canKill: false,
        abilitylimit: 1,
        team: "neutral",
        priority: 10,
        unique: false,
        cons_result: "Your target does not remember their role. They must be an Amnesiac.",
        invest_result: "Your target sticks to the shadows. They could be: Lookout/Forger/Amnesiac",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Amnesiac.png",
            Alignment: "Neutral (Benign)",
            Abilities: "Remember who you were by selecting a graveyard role.",
            Attributes: "When you choose a role it will be revealed to the Town.\nYou can't choose a unique role.",
            Goal: "Remember who you were and complete that roles objectives."
        }
    },
    Arsonist: {
        name: "Arsonist",
        canKill: true,
        abilitylimit: 1000,
        team: "neutral",
        priority: 7,
        unique: false,
        cons_result: "Your target enjoys watching things burn. They must be an Arsonist.",
        invest_result: "Your target is not afraid to get their hands dirty. They could be: Bodyguard/Godfather/Arsonist",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Arsonist.png",
            Alignment: "Neutral (Killing)",
            Abilities: "Douse someone in gasoline or ignite all doused targets.",
            Attributes: "Targets will know that they are doused in gasoline.\nDeath from fire can't be prevented by healing or night immunities.\nSelect yourself to ignite doused people.\nYou can take no action to undouse yourself.",
            Goal: "Live to see everyone burn."
        }
    },
    Executioner: {
        name: "Executioner",
        canKill: false,
        abilitylimit: 1000,
        team: "neutral",
        priority: 0,
        unique: false,
        cons_result: "Your target wants someone to be lynched at any cost. They must be an Executioner.",
        invest_result: "Your target is waiting for the perfect moment to strike. They could be: Sheriff/Executioner/Werewolf",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Executioner.png",
            Alignment: "Neutral (Evil)",
            Abilities: "Trick the Town into lynching your target.",
            Attributes: "If your target is killed at night you will become a Jester.\nYour target is always a Town member.",
            Goal: "Get your target lynched at any cost."
        }
    },
    Jester: {
        name: "Jester",
        canKill: false,
        abilitylimit: 1,
        team: "neutral",
        priority: 7,
        unique: false,
        cons_result: "Your target wants to be lynched. They must be a Jester.",
        invest_result: "Your target may not be what they seem. They could be: Framer/Vampire/Jester",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Jester.png",
            Alignment: "Neutral (Evil)",
            Abilities: "Trick the Town into voting against you.",
            Attributes: "If you are lynched you may kill one of your guilty voters the following night.",
            Goal: "Get yourself lynched by any means necessary."
        }
    },
    SerialKiller: {
        name: "Serial Killer",
        canKill: true,
        abilitylimit: 1000,
        team: "neutral",
        priority: 7,
        unique: false,
        cons_result: "Your target wants to kill everyone. They must be a Serial Killer.",
        invest_result: "Your target is covered in blood. They could be: Doctor/Disguiser/Serial Killer",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/SerialKiller.png",
            Alignment: "Neutral (Killing)",
            Abilities: "Kill someone each night.",
            Attributes: "If you are role blocked you will attack the role blocker instead of your target.\nYou can not be killed at night.",
            Goal: "Kill everyone who would oppose you."
        }
    },
    Survivor: {
        name: "Survivor",
        canKill: false,
        abilitylimit: 4,
        team: "neutral",
        priority: 4,
        unique: false,
        cons_result: "Your target simply wants to live. They must be a Survivor.",
        invest_result: "Your target keeps to themselves. They could be: Survivor/Vampire Hunter/Witch",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Survivor.png",
            Alignment: "Neutral (Benign)",
            Abilities: "Put on a bulletproof vest at night, protecting you from attacks.",
            Attributes: "You can only use the bulletproof vest 4 times.",
            Goal: "Live to the end of the game."
        }
    },
    Vampire: {
        name: "Vampire",
        canKill: false,
        abilitylimit: 1000,
        team: "neutral",
        priority: 7,
        unique: false,
        cons_result: "Your target drinks blood. They must be a Vampire!",
        invest_result: "Your target may not be what they seem. They could be: Framer/Vampire/Jester",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Vampire.png",
            Alignment: "Neutral (Chaos)",
            Abilities: "Convert others to Vampires at night.",
            Attributes: "Vampires vote at night to bite a target.\nThe youngest Vampire will visit the target at night.\nYou must wait 1 night between conversions.",
            Goal: "Convert everyone who would oppose you."
        }
    },
    Werewolf: {
        name: "Werewolf",
        canKill: true,
        abilitylimit: 1000,
        team: "neutral",
        priority: 8,
        unique: true,
        cons_result: "Your target howls at the moon. They must be a Werewolf.",
        invest_result: "Your target is waiting for the perfect moment to strike. They could be: Sheriff/Executioner/Werewolf",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Werewolf.png",
            Alignment: "Neutral (Killing)",
            Abilities: "Transform into a Werewolf during the full moon.",
            Attributes: "As a Werewolf you can not be killed at night.\nAs a Werewolf you will attack your victim and anyone that visits them.\nYour attack goes through night immunity.\nAs a Werewolf you may choose to stay home and attack anyone who visits you.",
            Goal: "Kill everyone who would oppose you."
        }
    },
    Witch: {
        name: "Witch",
        canKill: false,
        abilitylimit: 1000,
        team: "neutral",
        priority: 2,
        unique: false,
        cons_result: "Your target casts spells on people. They must be a Witch.",
        invest_result: "Your target keeps to themselves. They could be: Survivor/Vampire Hunter/Witch",
        info: {
            img: "https://www.blankmediagames.com/wp-content/themes/townofsalem/assets/img/roles/Witch.png",
            Alignment: "Neutral (Evil)",
            Abilities: "Control someone each night.",
            Attributes: "You can only control targetable actions such as detection and killing.\nYou can force people to target themselves.\nYour victim will know they are being controlled.",
            Goal: "Survive to see the Town lose the game."
        }
    },
    Troll: {
        name: "Troll",
        canKill: false,
        abilitylimit: 1000,
        team: "neutral",
        priority: 0,
        unique: true,
        cons_result: "ayy lmao 420 blaze it",
        invest_result: "dis guy be vaping the nation b4 t'was cool",
        info: {
            img: "http://en.wikifur.com/w/images/f/f3/Troll.png",
            Alignment: "Neutral (Benign)",
            Abilities: "You can drive people insane",
            Attributes: "You have lost the game, but you have fun trolling them all.\nYou can't be killed at night.",
            Goal: "Have fun."
        }
    }
};

module.exports = Role;
