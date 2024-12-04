export type Genre = {
    id: number;
    name: string;
  };
  
  export type VideoResult = {
    id: number;
    title: string;
  };
  
  export type Show = {
    id: number;
    title: string;
  };
  
  export type ShowWithGenreAndVideo = Show & {
    genres: Genre[];
    videos?: {
      results: VideoResult[];
    };
    seasons: { [key: string]: number };
  };
  
  