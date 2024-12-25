import { getCookie, setCookie } from "./helper"

export type acceptedLanguageType = "en" | "de" | "hr"
export const acceptedLanguages: acceptedLanguageType[] = ["en", "de", "hr"]

export const updateLanguageAndStoreInCookie = (
  language: acceptedLanguageType,
  updateLanguage: (newLanguage: acceptedLanguageType) => void
) => {
  if (typeof document == "undefined") return null

  // Set or update language cookie
  console.log("Storing language in cookie")
  setCookie("language", language, 365)

  // Also update language in application state
  updateLanguage(language)
}

export const getCopy = (dotPath: string, language: acceptedLanguageType) => {
  const properties = dotPath.split(".")
  let copy = translations as any

  // Resolve path
  for (const prop of properties) {
    if (copy.hasOwnProperty(prop)) {
      copy = copy[prop]
    } else {
      console.error(`Translation not found for key: ${dotPath}`)
      return "[Error]"
    }
  }

  // Resolve language
  copy = copy[language]

  if (!copy) {
    console.error(
      `No language version provided for key: ${dotPath} in language: ${language}`
    )
  }

  return copy
}

const translations = {
  general: {
    colors: {
      red: {
        en: "red",
        de: "rot",
        hr: "crvena",
      },
      green: {
        en: "green",
        de: "grün",
        hr: "zelena",
      },
      yellow: {
        en: "yellow",
        de: "gelb",
        hr: "žuta",
      },
      blue: {
        en: "blue",
        de: "blau",
        hr: "plava",
      },
    },
  },
  home: {
    playButton: {
      en: "Play",
      de: "Spielen",
      hr: "Igraj",
    },
    infoHeadline: {
      en: "About Malefiz",
      de: "Über Malefiz",
      hr: "O Malefizu",
    },
    infoTextParagraph1: {
      en: "Malefiz is a popular German board game that was first published in 1960 by the German company Ravensburger. The game is also known as Barricade or Barricade-Ludo in some countries. Malefiz is a strategic game that involves players trying to move their pawns from the start position to the home position while trying to block their opponents' pawns.",
      de: "Malefiz ist ein beliebtes deutsches Brettspiel, das 1960 zum ersten Mal vom deutschen Unternehmen Ravensburger veröffentlicht wurde. Das Spiel ist in einigen Ländern auch als Barricade oder Barricade-Ludo bekannt. Malefiz ist ein strategisches Spiel, bei dem die Spieler versuchen, ihre Spielfiguren von der Startposition zur Zielposition zu bewegen, während sie gleichzeitig versuchen, die Spielfiguren ihrer Gegner zu blockieren.",
      hr: "Malefiz je popularna njemačka društvena igra koju je prvi put objavila njemačka tvrtka Ravensburger 1960. godine. Igra je poznata i kao Barricade ili Barricade-Ludo u nekim zemljama. Malefiz je strateška igra u kojoj igrači pokušavaju premjestiti svoje figure s početne pozicije na ciljanu poziciju dok istovremeno blokiraju figure svojih protivnika.",
    },
    infoTextParagraph2: {
      en: "The gameplay of Malefiz involves a lot of strategy and tactical thinking as players must decide whether to advance their own pawns or block their opponents' pawns. The game is known for its simplicity, yet depth of strategy, making it popular among both children and adults.",
      de: "Das Gameplay von Malefiz erfordert viel Strategie und taktisches Denken, da die Spieler entscheiden müssen, ob sie ihre eigenen Spielfiguren vorwärts bewegen oder die Spielfiguren ihrer Gegner blockieren sollen. Das Spiel zeichnet sich durch seine Einfachheit und gleichzeitig durch seine tiefgehende Strategie aus, was es bei Kindern und Erwachsenen gleichermaßen beliebt macht.",
      hr: "Igranje Malefiza uključuje mnogo strategije i taktičkog razmišljanja jer igrači moraju odlučiti hoće li premjestiti svoje figure ili blokirati figure svojih protivnika. Igra je poznata po svojoj jednostavnosti, ali i dubini strategije, što je čini popularnom među djecom i odraslima.",
    },
    infoTextParagraph3: {
      en: "Malefiz was created by Werner Schöppner, a German game designer who was inspired by an earlier game called Pachisi. Pachisi is a traditional Indian board game that also involves moving pawns around a board while trying to block opponents' pawns. Schöppner adapted the basic gameplay of Pachisi to create Malefiz, adding a few new elements such as barricades to make the game more challenging and engaging.",
      de: "Malefiz wurde von Werner Schöppner, einem deutschen Spieleentwickler, kreiert, der sich von einem früheren Spiel namens Pachisi inspirieren ließ. Pachisi ist ein traditionelles indisches Brettspiel, bei dem es ebenfalls darum geht, Spielfiguren über das Spielbrett zu bewegen und gleichzeitig die Spielfiguren der Gegner zu blockieren. Schöppner hat das grundlegende Gameplay von Pachisi angepasst, um Malefiz zu erschaffen, und einige neue Elemente wie Barrikaden hinzugefügt, um das Spiel herausfordernder und fesselnder zu gestalten.",
      hr: "Malefiz je stvorio Werner Schöppner, njemački dizajner igara koji je bio inspiriran ranijom igrom nazvanom Pachisi. Pachisi je tradicionalna indijska društvena igra koja također uključuje premještanje figura po ploči uz pokušaj blokiranja figura protivnika. Schöppner je prilagodio osnovno igranje Pachisija kako bi stvorio Malefiz, dodavši nekoliko novih elemenata poput barikada kako bi igra postala izazovnija i zanimljivija.",
    },
    infoTextParagraph4: {
      en: "Since its release, Malefiz has become a classic board game in Germany and is enjoyed by players of all ages. The game has also been translated into several different languages and is popular in many other countries around the world.",
      de: "Seit seiner Veröffentlichung ist Malefiz zu einem klassischen Brettspiel in Deutschland geworden und erfreut Spieler jeden Alters. Das Spiel wurde auch in mehrere verschiedene Sprachen übersetzt und ist in vielen anderen Ländern auf der ganzen Welt beliebt.",
      hr: "Od svog izdanja, Malefiz je postao klasična društvena igra u Njemačkoj i uživaju je igrači svih dobnih skupina. Igra je također prevedena na nekoliko različitih jezika i popularna je u mnogim drugim zemljama diljem svijeta.",
    },
  },
  lobby: {
    quickGameButton: {
      en: "Quick Game",
      de: "Schnelles Spiel",
      hr: "Brza igra",
    },
    createLobbyButton: {
      en: "Create Lobby",
      de: "Lobby erstellen",
      hr: "Kreiraj sobu",
    },
    lobbyTitle: {
      en: "Lobby",
      de: "Lobby",
      hr: "Soba",
    },
    gameMode: {
      en: "Game Mode",
      de: "Spielmodus",
      hr: "Način igre",
    },
    gameModeNormal: {
      en: "Normal",
      de: "Normal",
      hr: "Normalno",
    },
    gameModeCompetition: {
      en: "Competition",
      de: "Herausforderung",
      hr: "Natjecanje",
    },
    cooldown: {
      en: "Cooldown",
      de: "Pausenzeit",
      hr: "Hlađenje",
    },
    emptyPlayerPlaceholder: {
      en: "No player yet.",
      de: "Noch kein Spieler.",
      hr: "Još nema igrača.",
    },
    emptyPlayerPlaceholderTooltip: {
      en: "Click to switch to this slot.",
      de: "Hier klicken um auf diesen Platz zu wechseln.",
      hr: "Kliknite da biste prešli na ovu poziciju.",
    },
    menuPlayAs: {
      en: "Play as ",
      de: "Spielen als ",
      hr: "Igraj kao ",
    },
    menuAddBot: {
      en: "Add bot",
      de: "KI Gegner hinzufügen",
      hr: "Dodaj robota",
    },
    startGameButton: {
      en: "Start Game",
      de: "Spiel starten",
      hr: "Započni igru",
    },
  },
  settings: {
    title: {
      en: "Settings",
      de: "Einstellungen",
      hr: "Postavke",
    },
    sounds: {
      en: "Sounds",
      de: "Audio",
      hr: "Zvukovi",
    },
    dice: {
      en: "Dice",
      de: "Würfel",
      hr: "Kockice",
    },
    pieces: {
      en: "Pieces",
      de: "Spielfiguren",
      hr: "Figurice",
    },
  },
  game: {
    rollDice: {
      en: "ROLL DICE!",
      de: "BITTE WÜRFELN!",
      hr: "BACI KOCKICU!",
    },
    infos: {
      ROLLED_DICE: {
        en: " rolled a ",
        de: " würfelt ",
        hr: " je bacila kockicu ",
      },
      KICKED_PLAYER: {
        en: " kicked ",
        de: " schmeißt ",
        hr: " je izbacila ",
      },
      MOVED_BLOCK: {
        en: " moved a ",
        de: " bewegt eine ",
        hr: " je premjestila ",
      },
      MOVED_BLOCK_blocker: {
        en: "blocker",
        de: "Blockade",
        hr: "blokator",
      },
      TURN: {
        en: "'s turn",
        de: " ist am Zug",
        hr: " je na potezu",
      },
      GAMEOVER: {
        en: " won the game!",
        de: " hat gewonnen!",
        hr: " je pobijedio/la igru!",
      },
    },
    instructions: {
      restart: {
        en: "Play again",
        de: "Nochmal spielen",
        hr: "Igraj ponovno",
      },
      backToLobby: {
        en: "Back to Lobby",
        de: "Zurück zur Lobby",
        hr: "Natrag u predvorje",
      },
    },
  },
  footer: {
    privacySettings: {
      en: "Privacy settings",
      de: "Datenschutzeinstellungen",
      hr: "Postavke privatnosti",
    },
  },
}
