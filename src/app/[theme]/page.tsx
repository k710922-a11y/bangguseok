import { TvHome } from "@/components/home/TvHome";
import { IlboHome } from "@/components/home/IlboHome";
import { getSettings, jokeOfTheDay, listCharacters, listEpisodes, listHallOfFame, listSeries } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ThemeHome({ params }: { params: Promise<{ theme: string }> }) {
  const { theme } = await params;
  const [settings, series, episodes, characters, joke, hall] = await Promise.all([
    getSettings(),
    listSeries(),
    listEpisodes(),
    listCharacters(),
    jokeOfTheDay(),
    listHallOfFame(5),
  ]);
  const d = { settings, series, episodes, characters, joke, hall };
  return theme === "ilbo" ? <IlboHome d={d} /> : <TvHome d={d} />;
}
