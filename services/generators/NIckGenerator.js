export const nickDict = [
    "Space Cowboy", 
    "Caring Companion", 
    "Tech Superhero", 
    "Wise Sage", 
    "Dancing Cyborg", 
    "Mad Scientist", 
    "Cosmic Traveler", 
    "Culinary Sage", 
    "Pixel Magician", 
    "Star Gazer", 
    "Fashion Wizard",
    "Treasure Hunter", 
    "Dream Weaver", 
    "Mindful Mystic", 
    "Grand Maestro",
    "Music Maestro",
    "Adventure Seeker",
    "Fun Nickname",
    "Mindful Observer",
    "Gentle Soul",
    "Inspired Creator",
    "Kindred Spirit",
    "Free Spirit",
    "Creative Spark",
    "Radiant Optimist"
]

function NickGenerator() {
    return nickDict[Math.round(Math.random() * (nickDict.length - 1))]
}

export default NickGenerator;