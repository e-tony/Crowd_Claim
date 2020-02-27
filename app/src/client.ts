import { Case } from './store';

const API_URL = 'https://273ac8ba.ngrok.io';

export interface RelatedCasesResult {
  rank: number;
  entities: { sentence: string };
  case: Case;
}

export async function getRelatedCases(
  queryString: string
): Promise<RelatedCasesResult[]> {
  const response = await fetch(
    `${API_URL}/user_inputs/${encodeURIComponent(queryString)}`
  );
  return await response.json();

  // return [
  //   {
  //     rank: 1,
  //     entities: [],
  //     case: {
  //       title: 'Title 1',
  //       description:
  //         'Die Fensterscheibe meines Autos fährt nicht mehr korrekt hoch und ich muss trotz Garantie 200 Euro für die Reparatur zahlen. Ich fahre einen VW.',
  //       num_litigants: 705,
  //     },
  //   },
  //   {
  //     rank: 2,
  //     entities: [],
  //     case: {
  //       title: 'Title 2',
  //       description:
  //         'Ich bin letzte Woche Freitag, am 21.02.2020 nach München geflogen mit easyjet und mein Flug hatte 3 Stunden verspätung.',
  //       num_litigants: 113,
  //     },
  //   },
  // ];
}
