export type Book = {
  id: number;
  bookId: string;
  title: string;
  wordCount: number;
  availableWordCount?: number;
  coverUrl: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type WordTranslation = {
  pos?: string;
  tranCn?: string;
  tranOther?: string;
  descCn?: string;
  descOther?: string;
};

export type WordSentence = {
  sContent: string;
  sCn: string;
};

export type WordSynonym = {
  pos?: string;
  tran?: string;
  words: string[];
};

export type WordPhrase = {
  pContent: string;
  pCn: string;
};

export type RelatedWordGroup = {
  pos?: string;
  words: Array<{
    hwd: string;
    tran: string;
  }>;
};

type RawWordPayload = {
  word?: {
    wordHead?: string;
    wordId?: string;
    content?: {
      sentence?: {
        sentences?: WordSentence[];
        desc?: string;
      };
      usphone?: string;
      ukphone?: string;
      phone?: string;
      speech?: string;
      ukspeech?: string;
      usspeech?: string;
      trans?: WordTranslation[];
      syno?: {
        synos?: Array<{
          pos?: string;
          tran?: string;
          hwds?: Array<{ w: string }>;
        }>;
        desc?: string;
      };
      phrase?: {
        phrases?: WordPhrase[];
        desc?: string;
      };
      relWord?: {
        rels?: RelatedWordGroup[];
        desc?: string;
      };
    };
  };
};

export type Word = {
  id: number;
  wordRank: number;
  headWord: string;
  content: RawWordPayload | string;
  bookId: string;
};

export type StudyWordView = {
  id: number;
  bookId: string;
  wordRank: number;
  headWord: string;
  ukphone?: string;
  usphone?: string;
  pos?: string;
  tranCn?: string;
  sentence?: {
    en: string;
    cn: string;
  };
};

export type WordDetailView = StudyWordView & {
  wordId: string;
  phone?: string;
  translations: WordTranslation[];
  sentences: Array<{
    en: string;
    cn: string;
  }>;
  synonyms: WordSynonym[];
  phrases: WordPhrase[];
  relatedWords: RelatedWordGroup[];
};

export const mockBooks: Book[] = [
  {
    id: 2,
    bookId: 'Level8_1',
    title: '专八真题高频词',
    wordCount: 684,
    coverUrl:
      'https://camo.githubusercontent.com/0bac08b7a00a2cfc7ae50987d8f20d6db4cadad67de9ff5bd87d61e74e3aa0b3/68747470733a2f2f6e6f732e6e6574656173652e636f6d2f79647363686f6f6c2d6f6e6c696e652f313439313033373730333335394c6576656c385f312e6a7067',
    tags: ['专八、有道'],
    createdAt: '2026-05-14T06:07:23.125845Z',
    updatedAt: '2026-05-14T06:10:50.152Z',
  },
];

function createWord(
  id: number,
  bookId: string,
  wordRank: number,
  headWord: string,
  pos: string,
  tranCn: string,
  tranOther: string,
  sentenceEn: string,
  sentenceCn: string,
  synonyms: string[],
  phrases: WordPhrase[] = [
    {
      pContent: `${headWord} practice`,
      pCn: `${headWord} 相关练习`,
    },
  ],
  relatedWords: RelatedWordGroup[] = [
    {
      pos,
      words: [
        {
          hwd: headWord,
          tran: tranCn,
        },
      ],
    },
  ],
): Word {
  const payload: RawWordPayload = {
    word: {
      wordHead: headWord,
      wordId: `${bookId}_${wordRank}`,
      content: {
        sentence: {
          sentences: [
            {
              sContent: sentenceEn,
              sCn: sentenceCn,
            },
          ],
          desc: '例句',
        },
        usphone: headWord === 'internship' ? "'ɪntɝnʃɪp" : `/${headWord}/`,
        ukphone: headWord === 'internship' ? 'ˈɪntɜ:nʃɪp' : `/${headWord}/`,
        phone: headWord,
        speech: headWord,
        ukspeech: `${headWord}&type=1`,
        usspeech: `${headWord}&type=2`,
        trans: [
          {
            pos,
            tranCn,
            tranOther,
            descCn: '中释',
            descOther: '英释',
          },
        ],
        syno: {
          synos: [
            {
              pos,
              tran: tranCn,
              hwds: synonyms.map((w) => ({ w })),
            },
          ],
          desc: '同近',
        },
        phrase: {
          phrases,
          desc: '短语',
        },
        relWord: {
          rels: relatedWords,
          desc: '同根',
        },
      },
    },
  };

  return {
    id,
    wordRank,
    headWord,
    bookId,
    content: JSON.stringify(payload),
  };
}

export const mockWords: Word[] = [
  createWord(
    101,
    'Level8_1',
    1,
    'internship',
    'n',
    '<美>实习医师',
    'a job that lasts for a short time, that someone, especially a student, does in order to gain experience',
    '...an internship in surgery in New York.',
    '…一个在纽约做外科实习的职位。',
    ['trainee', 'probationer'],
    [
      {
        pContent: 'internship programs',
        pCn: '实习计划；实习课程',
      },
    ],
    [
      {
        pos: 'n',
        words: [
          {
            hwd: 'intern',
            tran: ' 实习生，实习医师',
          },
          {
            hwd: 'interne',
            tran: ' 实习医师',
          },
        ],
      },
      {
        pos: 'vi',
        words: [
          {
            hwd: 'intern',
            tran: ' 作实习医师',
          },
        ],
      },
      {
        pos: 'vt',
        words: [
          {
            hwd: 'intern',
            tran: ' 拘留，软禁',
          },
        ],
      },
    ],
  ),
  createWord(
    102,
    'Level8_1',
    2,
    'brief',
    'adj',
    '短暂的；简洁的',
    'lasting only for a short time',
    'We had a brief conversation before the class began.',
    '上课前我们进行了一次简短的交谈。',
    ['short', 'concise'],
  ),
  createWord(
    103,
    'Level8_1',
    3,
    'capture',
    'v',
    '捕获；记录；吸引',
    'to catch someone or something, or to record an image',
    'The photo captures the quiet mood of the morning.',
    '这张照片捕捉到了清晨安静的氛围。',
    ['catch', 'record'],
  ),
  createWord(
    104,
    'Level8_1',
    4,
    'decline',
    'v',
    '下降；拒绝',
    'to become less or to politely refuse',
    'Sales began to decline after the holiday season.',
    '假期结束后销量开始下降。',
    ['decrease', 'refuse'],
  ),
  createWord(
    105,
    'Level8_1',
    5,
    'eager',
    'adj',
    '渴望的；热切的',
    'very interested and excited by something',
    'She was eager to try the new learning method.',
    '她很想尝试这种新的学习方法。',
    ['keen', 'enthusiastic'],
  ),
  createWord(
    201,
    'Level6_1',
    1,
    'abundant',
    'adj',
    '丰富的；充裕的',
    'existing in large quantities',
    'The region has abundant natural resources.',
    '这个地区拥有丰富的自然资源。',
    ['plentiful', 'ample'],
  ),
  createWord(
    202,
    'Level6_1',
    2,
    'coherent',
    'adj',
    '连贯的；有条理的',
    'clear and carefully considered',
    'Her argument was coherent and persuasive.',
    '她的论点连贯且有说服力。',
    ['logical', 'consistent'],
  ),
  createWord(
    203,
    'Level6_1',
    3,
    'derive',
    'v',
    '获得；源于',
    'to get something from something else',
    'Many words derive from Latin roots.',
    '许多单词源于拉丁词根。',
    ['obtain', 'originate'],
  ),
  createWord(
    204,
    'Level6_1',
    4,
    'implicit',
    'adj',
    '含蓄的；不明言的',
    'suggested without being directly expressed',
    'There was an implicit agreement between them.',
    '他们之间有一种默契。',
    ['implied', 'unspoken'],
  ),
  createWord(
    205,
    'Level6_1',
    5,
    'subtle',
    'adj',
    '微妙的；细微的',
    'not easy to notice or understand',
    'The story has a subtle sense of humor.',
    '这个故事有一种微妙的幽默感。',
    ['delicate', 'nuanced'],
  ),
  createWord(
    301,
    'Daily_1',
    1,
    'commute',
    'v',
    '通勤',
    'to travel regularly between home and work',
    'I commute by subway every morning.',
    '我每天早上坐地铁通勤。',
    ['travel', 'shuttle'],
  ),
  createWord(
    302,
    'Daily_1',
    2,
    'receipt',
    'n',
    '收据；小票',
    'a piece of paper showing that you paid for something',
    'Please keep the receipt for your records.',
    '请保留收据以备查。',
    ['proof', 'voucher'],
  ),
  createWord(
    303,
    'Daily_1',
    3,
    'appointment',
    'n',
    '预约；约会',
    'an arrangement to meet someone at a particular time',
    'I have a dentist appointment at three.',
    '我三点有一个牙医预约。',
    ['meeting', 'booking'],
  ),
  createWord(
    304,
    'Daily_1',
    4,
    'refund',
    'n',
    '退款',
    'money that is paid back to you',
    'The store offered a full refund.',
    '商店提供了全额退款。',
    ['repayment', 'return'],
  ),
  createWord(
    305,
    'Daily_1',
    5,
    'available',
    'adj',
    '可用的；有空的',
    'able to be used or free to do something',
    'Are you available tomorrow afternoon?',
    '你明天下午有空吗？',
    ['free', 'accessible'],
  ),
];

export function getBook(bookId: string) {
  return mockBooks.find((book) => book.bookId === bookId) ?? null;
}

export function getWordsByBook(bookId: string) {
  return mockWords
    .filter((word) => word.bookId === bookId)
    .sort((a, b) => a.wordRank - b.wordRank);
}

export function getWord(wordId: number) {
  return mockWords.find((word) => word.id === wordId) ?? null;
}

function parseWordPayload(content: Word['content']): RawWordPayload {
  if (typeof content === 'string') {
    try {
      return JSON.parse(content) as RawWordPayload;
    } catch {
      return {};
    }
  }

  return content ?? {};
}

function getWordPayload(word: Word) {
  const payload = parseWordPayload(word.content);
  const wordNode = payload.word ?? {};
  const content = wordNode.content ?? {};

  return {
    wordHead: wordNode.wordHead ?? word.headWord,
    wordId: wordNode.wordId ?? `${word.bookId}_${word.wordRank}`,
    content,
  };
}

export function toStudyWordView(word: Word): StudyWordView {
  const payload = getWordPayload(word);
  const content = payload.content;
  const firstTrans = content.trans?.[0];
  const firstSentence = content.sentence?.sentences?.[0];

  return {
    id: word.id,
    bookId: word.bookId,
    wordRank: word.wordRank,
    headWord: payload.wordHead,
    ukphone: content.ukphone,
    usphone: content.usphone,
    pos: firstTrans?.pos,
    tranCn: firstTrans?.tranCn,
    sentence: firstSentence
      ? {
          en: firstSentence.sContent,
          cn: firstSentence.sCn,
        }
      : undefined,
  };
}

export function toWordDetailView(word: Word): WordDetailView {
  const payload = getWordPayload(word);
  const content = payload.content;

  return {
    ...toStudyWordView(word),
    wordId: payload.wordId,
    phone: content.phone,
    translations: content.trans ?? [],
    sentences:
      content.sentence?.sentences?.map((sentence) => ({
        en: sentence.sContent,
        cn: sentence.sCn,
      })) ?? [],
    synonyms:
      content.syno?.synos?.map((syno) => ({
        pos: syno.pos,
        tran: syno.tran,
        words: syno.hwds?.map((hwd) => hwd.w) ?? [],
      })) ?? [],
    phrases: content.phrase?.phrases ?? [],
    relatedWords: content.relWord?.rels ?? [],
  };
}
