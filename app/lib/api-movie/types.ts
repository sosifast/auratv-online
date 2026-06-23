export interface MovieGenre {
  id: number;
  name: string;
}

export interface CastActor {
  id: number;
  name: string;
  character: string;
  profile_path: string;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string;
}

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  slug: string;
  seo_title: string;
  desc_title: string;
  overview: string;
  tagline?: string;
  release_date: string;
  year: string;
  runtime?: number;
  status?: string;
  budget?: number;
  revenue?: number;
  imdb_id?: string;
  homepage?: string;
  poster_url: string;
  backdrop_url: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  genres?: MovieGenre[];
  adult: boolean;
  actors?: CastActor[];
  directors?: CrewMember[];
  writers?: CrewMember[];
  producers?: CrewMember[];
  trailer?: string | null;
  keywords?: MovieGenre[];
}
