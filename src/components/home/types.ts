import type { Character, Episode, Joke, Series, SiteSettings, WrongAnswer } from "@/lib/types";

export type HomeData = {
  settings: SiteSettings;
  series: Series[];
  episodes: Episode[];
  characters: Character[];
  joke: Joke;
  hall: WrongAnswer[];
};
