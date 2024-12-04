export const topFootballClubsByCountry = [
    { country: "Spain", clubs: ["Real Madrid", "FC Barcelona", "Atletico Madrid", "Sevilla FC", "Valencia CF", "Villarreal CF", "Real Sociedad", "Athletic Bilbao", "Real Betis", "Deportivo La Coruña"] },
    { country: "England", clubs: ["Manchester United", "Liverpool", "Arsenal", "Chelsea", "Manchester City", "Tottenham Hotspur", "Leeds United", "Everton", "Newcastle United", "Aston Villa"] },
    { country: "Italy", clubs: ["AC Milan", "Juventus", "Inter Milan", "AS Roma", "Napoli", "Lazio", "Fiorentina", "Torino", "Bologna", "Parma"] },
    { country: "Germany", clubs: ["Bayern Munich", "Borussia Dortmund", "RB Leipzig", "Bayer Leverkusen", "Schalke 04", "Eintracht Frankfurt", "Wolfsburg", "Borussia Mönchengladbach", "Hamburg SV", "Stuttgart"] },
    { country: "Portugal", clubs: ["FC Porto", "Benfica", "Sporting CP", "Braga", "Vitória de Guimarães", "Marítimo", "Boavista", "Rio Ave", "Paços de Ferreira", "Estoril"] },
    { country: "France", clubs: ["Paris Saint-Germain", "Olympique de Marseille", "Olympique Lyonnais", "AS Monaco", "LOSC Lille", "RC Lens", "Stade Rennais", "OGC Nice", "Saint-Étienne", "Bordeaux"] },
    
  ];
  
  export function isTopClub(title: string): boolean {
    return topFootballClubsByCountry.some(country => 
      country.clubs.some(club => title.toLowerCase().includes(club.toLowerCase()))
    );
  }
  
  export function getTopClubPriority(title: string): number {
    for (let i = 0; i < 10; i++) { // Assuming max 10 clubs per country
      const clubsAtIndex = topFootballClubsByCountry.map(country => country.clubs[i]).filter(Boolean);
      const matchingClub = clubsAtIndex.find(club => title.toLowerCase().includes(club.toLowerCase()));
      if (matchingClub) {
        return i;
      }
    }
    return Infinity; // Return Infinity if not a top club
  }
  
  